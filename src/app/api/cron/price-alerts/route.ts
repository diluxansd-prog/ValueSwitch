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

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MIN_INTERVAL_MS = 20 * 60 * 60 * 1000; // 20 hours — guard against double-runs

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
  const run = await prisma.cronRun.create({
    data: {
      jobName: "price-alerts",
      ok: false,
      summary: JSON.stringify({ status: "running" }),
    },
  });

  const alerts = await prisma.priceAlert.findMany({
    where: { isActive: true },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
  });

  const results: PerAlertResult[] = [];

  for (const a of alerts) {
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
    await new Promise((r) => setTimeout(r, 600));
  }

  const sent = results.filter((r) => r.emailed).length;
  const failed = results.filter((r) => r.reason?.startsWith("send failed")).length;
  const durationMs = Date.now() - started;

  await prisma.cronRun.update({
    where: { id: run.id },
    data: {
      finishedAt: new Date(),
      durationMs,
      ok: failed === 0,
      error: failed > 0 ? `${failed} send(s) failed` : null,
      summary: JSON.stringify({
        totalAlerts: alerts.length,
        sent,
        failed,
        results,
      }),
    },
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
