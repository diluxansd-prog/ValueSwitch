/**
 * Weekly Awin feed refresh (Vercel cron).
 *
 * Schedule: every Sunday at 03:00 UTC (see vercel.json)
 * Auth: requires Authorization: Bearer <CRON_SECRET>
 *       Vercel cron jobs automatically send this header.
 *
 * Can also be triggered manually from /admin/cron, which requires an
 * admin user (checked via session) instead of the bearer secret.
 *
 * Side effects:
 *   - Imports new Vodafone deals from AWIN_VODAFONE_FEED_URL
 *   - Updates prices on existing deals + snapshots to PriceHistory
 *   - Pings IndexNow for new deal pages
 *   - Records run in CronRun table for audit history
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { importFeed } from "@/lib/feed-importer";
import { pingIndexNow } from "@/lib/indexnow";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60s for Hobby tier; 300s on Pro

async function isAuthorized(req: Request): Promise<{ ok: boolean; source: "cron" | "admin" | "denied" }> {
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

async function runJob(source: "cron" | "admin" | "denied") {
  const feedUrl = process.env.AWIN_VODAFONE_FEED_URL;
  const jobName = "refresh-feed";

  // Create run record immediately for observability
  const run = await prisma.cronRun.create({
    data: { jobName, ok: false },
  });

  if (!feedUrl) {
    await prisma.cronRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        durationMs: 0,
        ok: false,
        error:
          "AWIN_VODAFONE_FEED_URL env var is not set. Set it on Vercel to the gzipped CSV URL from your Awin dashboard.",
      },
    });
    return {
      ok: false,
      error: "AWIN_VODAFONE_FEED_URL env var is not set",
      source,
      runId: run.id,
    };
  }

  const result = await importFeed(feedUrl);

  // Ping IndexNow with new URLs (non-blocking)
  if (result.newDealUrls.length > 0) {
    pingIndexNow(result.newDealUrls).catch(() => null);
  }

  await prisma.cronRun.update({
    where: { id: run.id },
    data: {
      finishedAt: new Date(),
      durationMs: result.durationMs,
      ok: result.ok,
      error: result.error || null,
      summary: JSON.stringify(result.counts),
    },
  });

  return { ...result, source, runId: run.id };
}

export async function GET(req: Request) {
  const authResult = await isAuthorized(req);
  if (!authResult.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runJob(authResult.source);
  return NextResponse.json(result);
}

// Admin UI uses POST (action = "run" pattern)
export async function POST(req: Request) {
  const authResult = await isAuthorized(req);
  if (!authResult.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runJob(authResult.source);
  return NextResponse.json(result);
}
