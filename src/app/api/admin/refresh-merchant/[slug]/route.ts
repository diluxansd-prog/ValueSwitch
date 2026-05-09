/**
 * Per-merchant force-refresh endpoint.
 *
 * Runs `importFeed` for a single merchant (identified by slug) and
 * returns the result.  Lets the admin diagnose problems without having
 * to wait for the weekly cron or trigger ALL merchant feeds at once.
 *
 * Auth: admin session only — never callable by Vercel cron, never
 * callable by anonymous traffic.
 *
 * Failure modes surfaced cleanly to the caller:
 *   - merchant slug doesn't exist in MERCHANT_FEEDS → 404
 *   - feed URL env var not set → 422 with explanation
 *   - feed fetch returns non-200 → 502 with HTTP status from Awin
 *   - CSV parse failure → 500 with error message
 *   - Provider record missing in DB → 412 with hint to create one
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MERCHANT_FEEDS } from "@/config/merchants";
import { importFeed } from "@/lib/feed-importer";
import { reapOrphanedRunsByPrefix } from "@/lib/cron-reaper";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function isAdmin(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  return user?.role === "admin";
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const merchant = MERCHANT_FEEDS.find((m) => m.slug === slug);
  if (!merchant) {
    return NextResponse.json(
      { error: `Unknown merchant slug: ${slug}` },
      { status: 404 }
    );
  }

  // Whether or not cronSkip is set, allow manual refresh
  const feedUrl = process.env[merchant.feedUrlEnv];
  if (!feedUrl) {
    return NextResponse.json(
      {
        ok: false,
        merchant: slug,
        error: `Env var ${merchant.feedUrlEnv} not set on Vercel. Get the feed URL from Awin Dashboard → Toolbox → Create-A-Feed → ${merchant.name} → "Download URL" and add it to your Vercel project's Environment Variables.`,
        kind: "missing_env_var",
      },
      { status: 422 }
    );
  }

  // Pre-flight: confirm Provider record exists so we fail fast with a
  // clear error rather than a deep stack trace from importFeed.
  const provider = await prisma.provider.findUnique({
    where: { slug: merchant.slug },
    select: { id: true, name: true, isActive: true },
  });
  if (!provider) {
    return NextResponse.json(
      {
        ok: false,
        merchant: slug,
        error: `No Provider record found for "${slug}". Create one in /admin/providers before running a refresh.`,
        kind: "missing_provider_record",
      },
      { status: 412 }
    );
  }

  // Reap any prior stuck runs first
  await reapOrphanedRunsByPrefix("refresh-feed").catch(() => 0);

  // Record this manual run as a CronRun row so the admin run-history
  // includes it next to the scheduled ones — same shape, same UI.
  const run = await prisma.cronRun.create({
    data: {
      jobName: `refresh-feed:${slug}`,
      ok: false,
      summary: JSON.stringify({ status: "running", merchant: slug }),
    },
  });

  try {
    const result = await importFeed(merchant, feedUrl);
    await prisma.cronRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        durationMs: result.durationMs,
        ok: result.ok,
        error: result.error ?? null,
        summary: JSON.stringify({
          totalMerchants: 1,
          totalSucceeded: result.ok ? 1 : 0,
          totalFailed: result.ok ? 0 : 1,
          perMerchant: [
            {
              merchant: result.merchant,
              ok: result.ok,
              counts: result.counts,
              error: result.error,
            },
          ],
        }),
      },
    });
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    await prisma.cronRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        durationMs: 0,
        ok: false,
        error: msg,
        summary: JSON.stringify({
          totalMerchants: 1,
          totalSucceeded: 0,
          totalFailed: 1,
          perMerchant: [{ merchant: slug, ok: false, error: msg }],
        }),
      },
    });
    return NextResponse.json(
      { ok: false, merchant: slug, error: msg, kind: "fetch_or_parse_failure" },
      { status: 502 }
    );
  }
}
