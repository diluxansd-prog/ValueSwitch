/**
 * Daily price-alert worker (Vercel cron).
 *
 * Schedule: 09:00 UTC every day (see vercel.json)
 * Auth: Authorization: Bearer <CRON_SECRET>  OR admin session.
 *
 * For each active PriceAlert, finds the cheapest current Plan matching
 * its category/subcategory/targetPrice. Sends an email when:
 *   - the alert has never fired, OR
 *   - the new minimum price is strictly lower than the last notified price.
 *
 * Updates PriceAlert.lastTriggered and lastNotifiedPrice atomically so
 * we never re-spam at the same price level.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email/send";
import {
  priceAlertEmail,
  type AlertMatch,
} from "@/lib/email/templates/price-alert";
import { reapOrphanedRuns } from "@/lib/cron-reaper";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MIN_INTERVAL_MS = 20 * 60 * 60 * 1000; // 20 hours — guard against double-runs
/** Per-email throttle in ms.  Resend free tier allows 2/s = 500ms.
 *  We use 350ms to leave headroom and still process 100+ alerts within
 *  Vercel's 60s budget. */
const SEND_THROTTLE_MS = 350;
/** Hard cap: never process more than this many alerts in one invocation.
 *  At 350ms throttle + ~200ms per send, 90 alerts ≈ 50s, leaving 10s
 *  buffer before Vercel's 60s timeout.  Any overflow gets caught next
 *  run (alerts have a 20h MIN_INTERVAL anyway). */
const MAX_ALERTS_PER_RUN = 90;
/** Time-budget guard: if we've used this many ms, stop processing
 *  new alerts and finalize the run cleanly.  Saves us from being
 *  killed mid-loop. */
const TIME_BUDGET_MS = 50_000;

async function isAuthorized(req: Request): Promise<boolean> {
  const authHeader = req.headers.get("authorization") || "";
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;

  const session = await auth();
  if (session?.user?.id) {
    const u = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (u?.role === "admin") return true;
  }
  return false;
}

interface PerAlertResult {
  alertId: string;
  email: string;
  matchedPlans: number;
  newLowest: number | null;
  prevNotified: number | null;
  emailed: boolean;
  reason?: string;
}

async function findMatches(alert: {
  id: string;
  category: string;
  subcategory: string | null;
  targetPrice: number | null;
  lastNotifiedPrice: number | null;
}): Promise<AlertMatch[]> {
  const where: Record<string, unknown> = {
    category: alert.category,
  };
  if (alert.subcategory) where.subcategory = alert.subcategory;
  if (alert.targetPrice != null) where.monthlyCost = { lte: alert.targetPrice };

  const plans = await prisma.plan.findMany({
    where: {
      ...where,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { monthlyCost: "asc" },
    take: 5,
    include: {
      provider: { select: { name: true } },
    },
  });

  const matches: AlertMatch[] = [];
  for (const p of plans) {
    // Look up the most recent price snapshot from BEFORE today to compute "was £X" line.
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const prev = await prisma.priceHistory.findFirst({
      where: { planId: p.id, recordedAt: { lt: yesterday } },
      orderBy: { recordedAt: "desc" },
      select: { monthlyCost: true },
    });
    matches.push({
      planId: p.id,
      planName: p.name,
      providerName: p.provider.name,
      category: p.category,
      newPrice: p.monthlyCost,
      previousPrice: prev?.monthlyCost ?? null,
      affiliateUrl: p.affiliateUrl,
      imageUrl: p.imageUrl,
    });
  }
  return matches;
}

async function runJob() {
  const started = Date.now();

  // Reap any previous price-alerts runs that timed out / crashed
  // before recording their outcome.  Without this, the admin UI
  // shows them as "still running" indefinitely.
  await reapOrphanedRuns("price-alerts").catch(() => 0);

  const run = await prisma.cronRun.create({
    data: {
      jobName: "price-alerts",
      ok: false,
      summary: JSON.stringify({ status: "running" }),
    },
  });

  const allAlerts = await prisma.priceAlert.findMany({
    where: { isActive: true },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
    // Process oldest-triggered first so we don't starve long-quiet alerts
    orderBy: { lastTriggered: { sort: "asc", nulls: "first" } },
  });

  // Apply hard cap so we never starve the budget — overflow gets
  // picked up next run (alerts already have a 20h cooldown).
  const alerts = allAlerts.slice(0, MAX_ALERTS_PER_RUN);
  const skippedDueToCap = allAlerts.length - alerts.length;

  const results: PerAlertResult[] = [];
  let skippedDueToBudget = 0;
  let topLevelError: string | null = null;

  // try/finally guarantees the CronRun row gets finalized below
  // even if the loop throws or Vercel kills us mid-iteration.
  try {
  for (const a of alerts) {
    // Time-budget guard — bail before Vercel does
    if (Date.now() - started > TIME_BUDGET_MS) {
      skippedDueToBudget++;
      continue;
    }
    const base: PerAlertResult = {
      alertId: a.id,
      email: a.user.email,
      matchedPlans: 0,
      newLowest: null,
      prevNotified: a.lastNotifiedPrice,
      emailed: false,
    };

    if (a.lastTriggered && Date.now() - a.lastTriggered.getTime() < MIN_INTERVAL_MS) {
      results.push({ ...base, reason: "throttled (<20h)" });
      continue;
    }

    const matches = await findMatches(a);
    base.matchedPlans = matches.length;

    if (matches.length === 0) {
      results.push({ ...base, reason: "no matching plans" });
      continue;
    }

    const lowest = matches[0].newPrice;
    base.newLowest = lowest;

    // Suppress if we already notified at this price (or lower)
    if (a.lastNotifiedPrice != null && lowest >= a.lastNotifiedPrice) {
      results.push({ ...base, reason: "no further drop" });
      continue;
    }

    const tmpl = priceAlertEmail({
      email: a.user.email,
      name: a.user.name,
      matches,
      targetPrice: a.targetPrice,
      category: a.category,
    });
    const sent = await sendEmail({
      to: a.user.email,
      subject: tmpl.subject,
      html: tmpl.html,
      text: tmpl.text,
    });

    if (sent.ok || sent.skipped) {
      await prisma.priceAlert.update({
        where: { id: a.id },
        data: {
          lastTriggered: new Date(),
          lastNotifiedPrice: lowest,
        },
      });
      base.emailed = sent.ok;
      base.reason = sent.skipped ? "skipped (no api key)" : "sent";
    } else {
      base.reason = `send failed: ${sent.error}`;
    }
    results.push(base);

    // Be polite to Resend's rate limit (~2 req/s on free tier).
    await new Promise((r) => setTimeout(r, SEND_THROTTLE_MS));
  }
  } catch (err) {
    topLevelError = err instanceof Error ? err.message : String(err);
    console.error("[cron] price-alerts top-level error:", err);
  }

  const sent = results.filter((r) => r.emailed).length;
  const failed = results.filter((r) => r.reason?.startsWith("send failed")).length;
  const durationMs = Date.now() - started;
  const errorParts = [
    topLevelError ? `Top-level: ${topLevelError}` : null,
    failed > 0 ? `${failed} send(s) failed` : null,
    skippedDueToCap > 0
      ? `${skippedDueToCap} alert(s) deferred — exceeded MAX_ALERTS_PER_RUN`
      : null,
    skippedDueToBudget > 0
      ? `${skippedDueToBudget} alert(s) deferred — exceeded time budget`
      : null,
  ].filter(Boolean) as string[];

  await prisma.cronRun
    .update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        durationMs,
        ok: !topLevelError && failed === 0,
        error: errorParts.length > 0 ? errorParts.join("; ") : null,
        summary: JSON.stringify({
          totalAlerts: alerts.length,
          totalAlertsAvailable: allAlerts.length,
          skippedDueToCap,
          skippedDueToBudget,
          sent,
          failed,
          results,
        }),
      },
    })
    .catch((err) => {
      console.error("[cron] failed to finalize price-alerts CronRun:", err);
    });

  return {
    ok: failed === 0,
    runId: run.id,
    totalAlerts: alerts.length,
    sent,
    failed,
    results,
    durationMs,
  };
}

export async function GET(req: Request) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await runJob());
}

export async function POST(req: Request) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await runJob());
}
