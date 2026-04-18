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
import { importFeed, type FeedImportResult } from "@/lib/feed-importer";
import { pingIndexNow } from "@/lib/indexnow";
import { auth } from "@/lib/auth";
import { getActiveMerchantFeeds, MERCHANT_FEEDS } from "@/config/merchants";

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
  const activeFeeds = getActiveMerchantFeeds();
  const skipped = MERCHANT_FEEDS.filter(
    (m) => !activeFeeds.some((af) => af.slug === m.slug)
  ).map((m) => ({
    merchant: m.slug,
    reason: `${m.feedUrlEnv} env var not set`,
  }));

  const run = await prisma.cronRun.create({
    data: {
      jobName: "refresh-feed",
      ok: false,
      summary: JSON.stringify({
        status: "running",
        totalMerchants: activeFeeds.length,
      }),
    },
  });

  const perMerchant: FeedImportResult[] = [];
  const newUrlsAll: string[] = [];

  for (const m of activeFeeds) {
    const r = await importFeed(m, m.feedUrl);
    perMerchant.push(r);
    if (r.newDealUrls) newUrlsAll.push(...r.newDealUrls);
  }

  // Batch-ping IndexNow with all new URLs across all merchants
  if (newUrlsAll.length > 0) {
    pingIndexNow(newUrlsAll).catch(() => null);
  }

  const totalSucceeded = perMerchant.filter((r) => r.ok).length;
  const totalFailed = perMerchant.filter((r) => !r.ok).length;
  const overallOk = totalFailed === 0 && activeFeeds.length > 0;
  const durationMs = Date.now() - started;

  await prisma.cronRun.update({
    where: { id: run.id },
    data: {
      finishedAt: new Date(),
      durationMs,
      ok: overallOk,
      error:
        activeFeeds.length === 0
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
