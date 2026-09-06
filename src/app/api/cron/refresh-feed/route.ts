/**
 * Weekly multi-merchant Awin feed refresh (Vercel cron) — DISPATCHER.
 *
 * Schedule: Sunday 03:00 UTC (see vercel.json)
 * Auth: Authorization: Bearer <CRON_SECRET>  (Vercel sends automatically)
 *       OR admin session cookie.
 *
 * One 60s function cannot import 10 merchant feeds (a single large
 * import can eat the whole budget — feeds starved for months because
 * of this). Instead, this route FANS OUT: it POSTs each merchant to
 * /api/admin/refresh-merchant/[slug], so every import runs in its own
 * 60-second function invocation. Merchants are dispatched stalest-first
 * with limited concurrency; whatever cannot be dispatched inside the
 * budget is recorded as deferred and, being stalest, goes first next
 * run. Each sub-invocation also records its own refresh-feed:<slug>
 * CronRun row, so the admin history shows per-merchant ground truth.
 *
 * A soft-deadline finalizer guarantees this run's CronRun row is
 * finalized before Vercel's 60s kill — no more orphaned "running" rows.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { FeedImportResult } from "@/lib/feed-importer";
import { pingIndexNow } from "@/lib/indexnow";
import { auth } from "@/lib/auth";
import { getActiveMerchantFeeds, MERCHANT_FEEDS } from "@/config/merchants";
import { reapOrphanedRunsByPrefix } from "@/lib/cron-reaper";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // Fluid Compute allows up to 300s on Hobby

/** Don't START a new merchant dispatch after this much elapsed time. */
const DISPATCH_CUTOFF_MS = 200_000;
/** Abort in-flight sub-requests and finalize by this point. */
const SOFT_DEADLINE_MS = 280_000;
/** Sequential on purpose: Fluid Compute routes concurrent invocations
 *  onto a SHARED instance, and parallel combined-CSV parses OOM-killed
 *  the whole instance (dispatcher included). One at a time also lets
 *  the sub-route's warm-instance CSV cache do its job. */
const CONCURRENCY = 1;

async function isAuthorized(
  req: Request
): Promise<{ ok: boolean; source: "cron" | "admin" | "denied" }> {
  const authHeader = req.headers.get("authorization") || "";
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return { ok: true, source: "cron" };
  }
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
  deferred: string[];
  durationMs: number;
}

function emptyResult(slug: string, error: string): FeedImportResult {
  return {
    ok: false,
    merchant: slug,
    source: "fan-out",
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
    error,
  };
}

async function runJob(
  source: "cron" | "admin" | "denied",
  origin: string
): Promise<MultiMerchantResult> {
  const started = Date.now();

  await reapOrphanedRunsByPrefix("refresh-feed").catch(() => 0);

  const combinedUrl = process.env.AWIN_COMBINED_FEED_URL;
  const activeFeeds = getActiveMerchantFeeds();

  // Importable = own feed URL, or the combined feed covers it.
  const importable = MERCHANT_FEEDS.filter(
    (m) =>
      !m.cronSkip &&
      (activeFeeds.some((af) => af.slug === m.slug) || Boolean(combinedUrl))
  );
  const skipped = MERCHANT_FEEDS.filter(
    (m) => !importable.some((im) => im.slug === m.slug)
  ).map((m) => ({
    merchant: m.slug,
    reason: m.cronSkip
      ? "cronSkip flag set"
      : `${m.feedUrlEnv} env var not set (and no combined feed)`,
  }));

  const run = await prisma.cronRun.create({
    data: {
      jobName: "refresh-feed",
      ok: false,
      summary: JSON.stringify({
        status: "running",
        totalMerchants: importable.length,
      }),
    },
  });

  const perMerchant: FeedImportResult[] = [];
  const deferred: string[] = [];
  const newUrlsAll: string[] = [];
  let topLevelError: string | null = null;

  // Guaranteed finalize — soft-deadline timer wins if the work overruns.
  let finalized = false;
  async function finalize(note: string | null) {
    if (finalized) return;
    finalized = true;
    const totalSucceeded = perMerchant.filter((r) => r.ok).length;
    const totalFailed = perMerchant.filter((r) => !r.ok).length;
    const errorParts = [
      note,
      topLevelError ? `Top-level: ${topLevelError}` : null,
      importable.length === 0
        ? "No merchant feeds configured. Set *_FEED_URL or AWIN_COMBINED_FEED_URL."
        : null,
      totalFailed > 0
        ? perMerchant
            .filter((r) => !r.ok)
            .map((r) => `${r.merchant}: ${r.error}`)
            .join("; ")
        : null,
      deferred.length > 0
        ? `deferred (stalest-first next run): ${deferred.join(", ")}`
        : null,
    ].filter(Boolean) as string[];
    await prisma.cronRun
      .update({
        where: { id: run.id },
        data: {
          finishedAt: new Date(),
          durationMs: Date.now() - started,
          ok:
            !note &&
            !topLevelError &&
            totalFailed === 0 &&
            importable.length > 0,
          error: errorParts.length > 0 ? errorParts.join(" | ") : null,
          summary: JSON.stringify({
            totalMerchants: importable.length,
            totalSucceeded,
            totalFailed,
            deferred,
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
        console.error("[cron] failed to finalize CronRun:", err);
      });
  }
  const softDeadline = setTimeout(() => {
    void finalize("soft-deadline finalize — dispatches overran the budget");
  }, SOFT_DEADLINE_MS);

  try {
    // Stalest-first: merchants whose plans were updated longest ago go
    // first, so a feed starved by one run leads the queue next time.
    const providerFreshness = await prisma.provider
      .findMany({
        select: {
          slug: true,
          plans: {
            select: { updatedAt: true },
            orderBy: { updatedAt: "desc" },
            take: 1,
          },
        },
      })
      .catch(() => [] as { slug: string; plans: { updatedAt: Date }[] }[]);
    const lastImportBySlug = new Map(
      providerFreshness.map((p) => [
        p.slug,
        p.plans[0]?.updatedAt?.getTime() ?? 0,
      ])
    );
    const queue = importable
      .map((m) => m.slug)
      .sort((a, b) => (lastImportBySlug.get(a) ?? 0) - (lastImportBySlug.get(b) ?? 0));

    const cronSecret = process.env.CRON_SECRET;
    const dispatchOne = async (slug: string): Promise<FeedImportResult> => {
      try {
        const remaining = Math.max(5_000, SOFT_DEADLINE_MS - (Date.now() - started) - 2_000);
        const res = await fetch(`${origin}/api/admin/refresh-merchant/${slug}`, {
          method: "POST",
          headers: cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {},
          signal: AbortSignal.timeout(remaining),
        });
        const j = (await res.json().catch(() => null)) as
          | (FeedImportResult & { counts?: unknown })
          | { error?: string }
          | null;
        if (j && typeof j === "object" && "counts" in j && j.counts) {
          return j as FeedImportResult;
        }
        return emptyResult(
          slug,
          (j as { error?: string } | null)?.error || `sub-request HTTP ${res.status}`
        );
      } catch (err) {
        // Timeout abort: the sub-invocation usually keeps running server-
        // side and records its own refresh-feed:<slug> row — check there.
        return emptyResult(
          slug,
          err instanceof Error && err.name === "TimeoutError"
            ? "dispatcher stopped waiting (sub-import may still complete — see its own run row)"
            : err instanceof Error
              ? err.message
              : "dispatch failed"
        );
      }
    };

    const workers = Array.from({ length: CONCURRENCY }, async () => {
      while (queue.length > 0) {
        if (Date.now() - started > DISPATCH_CUTOFF_MS) {
          deferred.push(...queue.splice(0, queue.length));
          break;
        }
        const slug = queue.shift();
        if (!slug) break;
        const r = await dispatchOne(slug);
        perMerchant.push(r);
        if (r.newDealUrls) newUrlsAll.push(...r.newDealUrls);
      }
    });
    await Promise.all(workers);

    if (newUrlsAll.length > 0) {
      pingIndexNow(newUrlsAll).catch(() => null);
    }
  } catch (err) {
    topLevelError = err instanceof Error ? err.message : String(err);
    console.error("[cron] catastrophic refresh-feed error:", err);
  }

  clearTimeout(softDeadline);
  await finalize(null);

  const totalSucceeded = perMerchant.filter((r) => r.ok).length;
  const totalFailed = perMerchant.filter((r) => !r.ok).length;
  return {
    ok: !topLevelError && totalFailed === 0 && importable.length > 0,
    source,
    runId: run.id,
    totalMerchants: importable.length,
    totalSucceeded,
    totalFailed,
    perMerchant,
    skipped,
    deferred,
    durationMs: Date.now() - started,
  };
}

export async function GET(req: Request) {
  const authResult = await isAuthorized(req);
  if (!authResult.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(
    await runJob(authResult.source, new URL(req.url).origin)
  );
}

export async function POST(req: Request) {
  const authResult = await isAuthorized(req);
  if (!authResult.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(
    await runJob(authResult.source, new URL(req.url).origin)
  );
}
