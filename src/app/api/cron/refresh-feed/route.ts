/**
 * Weekly multi-merchant Awin feed refresh (Vercel cron).
 *
 * Schedule: Sunday 03:00 UTC (see vercel.json)
 * Auth: Authorization: Bearer <CRON_SECRET>  (Vercel sends automatically)
 *       OR admin session cookie.
 *
 * Iterates every merchant in src/config/merchants.ts whose feed URL env
 * var is set (see getActiveMerchantFeeds). Imports them sequentially so
 * the serverless function stays well under the 60s Hobby-tier budget
 * even with 4-5 partners configured.
 *
 * Side effects per merchant:
 *   - Imports new deals with stable affiliate URLs
 *   - Updates prices + snapshots PriceHistory on every change
 *   - Pings IndexNow for brand-new deal pages
 *
 * All runs recorded to CronRun with per-merchant summary JSON.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  importFeed,
  importFromCsv,
  type FeedImportResult,
} from "@/lib/feed-importer";
import { pingIndexNow } from "@/lib/indexnow";
import { auth } from "@/lib/auth";
import { getActiveMerchantFeeds, MERCHANT_FEEDS } from "@/config/merchants";
import { reapOrphanedRunsByPrefix } from "@/lib/cron-reaper";
import { gunzipSync } from "zlib";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function isAuthorized(
  req: Request
): Promise<{ ok: boolean; source: "cron" | "admin" | "denied" }> {
  // Vercel Cron: Bearer <CRON_SECRET>
  const authHeader = req.headers.get("authorization") || "";
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return { ok: true, source: "cron" };
  }

  // Admin manual trigger via session
  const session = await auth();
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (user?.role === "admin") return { ok: true, source: "admin" };
  }

  return { ok: false, source: "denied" };
}

interface MultiMerchantResult {
  ok: boolean;
  source: "cron" | "admin" | "denied";
  runId: string;
  totalMerchants: number;
  totalSucceeded: number;
  totalFailed: number;
  perMerchant: FeedImportResult[];
  skipped: Array<{ merchant: string; reason: string }>;
  durationMs: number;
}

async function runJob(
  source: "cron" | "admin" | "denied"
): Promise<MultiMerchantResult> {
  const started = Date.now();

  // Reap any previously-orphaned refresh-feed* runs so the UI doesn't
  // show stale spinners.  Anything that's been "running" for >5 mins
  // got killed by Vercel's function timeout and never recorded its
  // outcome — mark it as failed so the operator can see something
  // actually went wrong.
  await reapOrphanedRunsByPrefix("refresh-feed").catch(() => 0);

  const activeFeeds = getActiveMerchantFeeds();

  // OPTIMISATION: AWIN_COMBINED_FEED_URL = one URL with multiple FIDs.
  // When set, download the CSV ONCE and dispatch all merchants from it.
  // This is what every cron run will do once we wire up Awin's combined
  // download.  Cuts a 6-merchant import from ~30s to ~10s and ships a
  // single 5-MB request instead of six.
  const combinedUrl = process.env.AWIN_COMBINED_FEED_URL;

  // Only merchants without their OWN feed URL fall back to combined feed.
  const merchantsForCombined = combinedUrl
    ? MERCHANT_FEEDS.filter(
        (m) => !m.cronSkip && !process.env[m.feedUrlEnv]
      )
    : [];

  const skipped = MERCHANT_FEEDS.filter(
    (m) =>
      !activeFeeds.some((af) => af.slug === m.slug) &&
      !merchantsForCombined.some((cm) => cm.slug === m.slug)
  ).map((m) => ({
    merchant: m.slug,
    reason: m.cronSkip
      ? "cronSkip flag set"
      : `${m.feedUrlEnv} env var not set`,
  }));

  const run = await prisma.cronRun.create({
    data: {
      jobName: "refresh-feed",
      ok: false,
      summary: JSON.stringify({
        status: "running",
        totalMerchants: activeFeeds.length + merchantsForCombined.length,
      }),
    },
  });

  const perMerchant: FeedImportResult[] = [];
  const newUrlsAll: string[] = [];
  let topLevelError: string | null = null;

  // CRITICAL: wrap the whole import loop in try/finally so the
  // CronRun row ALWAYS gets finalized — even if a merchant import
  // throws or the function gets killed by the Vercel timeout.  Without
  // this, the row stays "running" forever and the admin UI shows a
  // hopeful spinner that never resolves.
  try {
    // Path 1: per-merchant feeds (each downloads its own CSV)
    for (const m of activeFeeds) {
      try {
        const r = await importFeed(m, m.feedUrl);
        perMerchant.push(r);
        if (r.newDealUrls) newUrlsAll.push(...r.newDealUrls);
      } catch (err) {
        // Defensive: even if importFeed throws (rare — it usually
        // returns a result with ok:false), don't kill the whole run.
        perMerchant.push({
          ok: false,
          merchant: m.slug,
          source: "per-merchant",
          durationMs: 0,
          counts: {
            totalRows: 0,
            uniqueDeals: 0,
            created: 0,
            updated: 0,
            unchanged: 0,
            priceChanges: 0,
            errors: 0,
          },
          newDealUrls: [],
          error: err instanceof Error ? err.message : "import threw",
        });
      }
    }

    // Path 2: combined feed — fetch once, dispatch many
    if (combinedUrl && merchantsForCombined.length > 0) {
      try {
        console.log(`[cron] fetching combined feed for ${merchantsForCombined.length} merchants...`);
        const res = await fetch(combinedUrl, {
          headers: { "User-Agent": "ValueSwitchBot/1.0" },
        });
        if (!res.ok) throw new Error(`combined feed fetch HTTP ${res.status}`);
        const ab = await res.arrayBuffer();
        const buf = Buffer.from(ab);
        const csv = (() => {
          try {
            return gunzipSync(buf).toString("utf-8");
          } catch {
            return buf.toString("utf-8");
          }
        })();
        console.log(`[cron] combined feed = ${(buf.length / 1024 / 1024).toFixed(2)} MB`);

        for (const m of merchantsForCombined) {
          const r = await importFromCsv(m, csv, "combined-feed");
          perMerchant.push(r);
          if (r.newDealUrls) newUrlsAll.push(...r.newDealUrls);
        }
      } catch (err) {
        console.error("[cron] combined feed failed:", err);
        // mark each merchant as failed
        for (const m of merchantsForCombined) {
          perMerchant.push({
            ok: false,
            merchant: m.slug,
            source: "combined-feed",
            durationMs: 0,
            counts: {
              totalRows: 0,
              uniqueDeals: 0,
              created: 0,
              updated: 0,
              unchanged: 0,
              priceChanges: 0,
              errors: 0,
            },
            newDealUrls: [],
            error: err instanceof Error ? err.message : "combined fetch failed",
          });
        }
      }
    }

    // Batch-ping IndexNow with all new URLs across all merchants
    if (newUrlsAll.length > 0) {
      pingIndexNow(newUrlsAll).catch(() => null);
    }
  } catch (err) {
    // Should not reach here under normal conditions — per-merchant
    // errors are absorbed above. This is the catastrophic fallback
    // (DB connection lost, OOM, etc).
    topLevelError = err instanceof Error ? err.message : String(err);
    console.error("[cron] catastrophic refresh-feed error:", err);
  }

  const totalSucceeded = perMerchant.filter((r) => r.ok).length;
  const totalFailed = perMerchant.filter((r) => !r.ok).length;
  const overallOk =
    !topLevelError && totalFailed === 0 && activeFeeds.length > 0;
  const durationMs = Date.now() - started;

  // ALWAYS finalize the CronRun, even if everything above threw.
  await prisma.cronRun
    .update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        durationMs,
        ok: overallOk,
        error: topLevelError
          ? `Top-level: ${topLevelError}`
          : activeFeeds.length === 0
            ? "No merchant feeds configured. Set at least one *_FEED_URL env var."
            : totalFailed > 0
              ? perMerchant
                  .filter((r) => !r.ok)
                  .map((r) => `${r.merchant}: ${r.error}`)
                  .join("; ")
              : null,
        summary: JSON.stringify({
          totalMerchants: activeFeeds.length,
          totalSucceeded,
          totalFailed,
          skipped,
          perMerchant: perMerchant.map((r) => ({
            merchant: r.merchant,
            ok: r.ok,
            counts: r.counts,
            error: r.error,
          })),
        }),
      },
    })
    .catch((err) => {
      // If even the finalize fails, log loudly — but don't throw
      // out of runJob since the orphan reaper will catch it next time.
      console.error("[cron] failed to finalize CronRun:", err);
    });

  return {
    ok: overallOk,
    source,
    runId: run.id,
    totalMerchants: activeFeeds.length,
    totalSucceeded,
    totalFailed,
    perMerchant,
    skipped,
    durationMs,
  };
}

export async function GET(req: Request) {
  const authResult = await isAuthorized(req);
  if (!authResult.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await runJob(authResult.source));
}

export async function POST(req: Request) {
  const authResult = await isAuthorized(req);
  if (!authResult.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await runJob(authResult.source));
}
