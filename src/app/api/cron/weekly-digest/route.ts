/**
 * Weekly digest worker (Vercel cron).
 *
 * Schedule: Sunday 09:00 UTC (after refresh-feed at 03:00) — see vercel.json
 * Auth: Authorization: Bearer <CRON_SECRET>  OR admin session.
 *
 * For each active NewsletterSubscriber, sends a digest of the top 3 cheapest
 * deals in three categories (mobile, broadband, refurbished). Personalisation
 * is intentionally minimal — list members are anonymous (email-only).
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendBatch } from "@/lib/email/send";
import {
  weeklyDigestEmail,
  type DigestSection,
  type DigestDeal,
} from "@/lib/email/templates/digest";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

async function topDealsByCategory(
  category: string,
  limit: number,
  subcategory?: string
): Promise<DigestDeal[]> {
  const where: Record<string, unknown> = {
    category,
    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
  };
  if (subcategory) where.subcategory = subcategory;

  const plans = await prisma.plan.findMany({
    where,
    orderBy: { monthlyCost: "asc" },
    take: limit,
    include: { provider: { select: { name: true } } },
  });

  return plans.map((p) => ({
    planId: p.id,
    planName: p.name,
    providerName: p.provider.name,
    category: p.category,
    monthlyCost: p.monthlyCost,
    affiliateUrl: p.affiliateUrl,
    badge: p.isPromoted ? "Promoted" : p.isBestValue ? "Best value" : null,
  }));
}

function weekLabel(): string {
  const now = new Date();
  return now.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

async function runJob() {
  const started = Date.now();
  const run = await prisma.cronRun.create({
    data: {
      jobName: "weekly-digest",
      ok: false,
      summary: JSON.stringify({ status: "running" }),
    },
  });

  const [mobile, broadband, refurb] = await Promise.all([
    topDealsByCategory("mobile", 3),
    topDealsByCategory("broadband", 3),
    topDealsByCategory("mobile", 3, "refurbished"),
  ]);

  const sections: DigestSection[] = [
    { category: "mobile", heading: "📱 Top mobile deals", deals: mobile },
    { category: "broadband", heading: "🌐 Top broadband deals", deals: broadband },
    { category: "refurbished", heading: "♻️ Best refurbished phones", deals: refurb },
  ];

  if (sections.every((s) => s.deals.length === 0)) {
    await prisma.cronRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        durationMs: Date.now() - started,
        ok: false,
        error: "No deals available — skipping digest",
        summary: JSON.stringify({ subscribers: 0, sent: 0, reason: "no deals" }),
      },
    });
    return {
      ok: false,
      runId: run.id,
      reason: "No deals available",
    };
  }

  const subs = await prisma.newsletterSubscriber.findMany({
    where: { isActive: true },
    select: { email: true },
  });

  const label = weekLabel();
  const messages = subs.map((s) => {
    const t = weeklyDigestEmail({ email: s.email, sections, weekLabel: label });
    return { to: s.email, subject: t.subject, html: t.html, text: t.text };
  });

  const result = await sendBatch(messages, 600);
  const durationMs = Date.now() - started;

  await prisma.cronRun.update({
    where: { id: run.id },
    data: {
      finishedAt: new Date(),
      durationMs,
      ok: result.failed === 0,
      error: result.failed > 0 ? `${result.failed} send(s) failed` : null,
      summary: JSON.stringify({
        subscribers: subs.length,
        sent: result.sent,
        failed: result.failed,
        skipped: result.skipped,
        sectionCounts: sections.map((s) => ({
          category: s.category,
          deals: s.deals.length,
        })),
      }),
    },
  });

  return {
    ok: result.failed === 0,
    runId: run.id,
    subscribers: subs.length,
    sent: result.sent,
    failed: result.failed,
    skipped: result.skipped,
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
