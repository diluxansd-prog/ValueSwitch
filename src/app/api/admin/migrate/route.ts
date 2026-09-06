/**
 * Idempotent schema-drift repair endpoint (admin session only).
 *
 * The production DB is updated via `prisma db push` from a machine that
 * has the prod DATABASE_URL — which means columns added to the Prisma
 * schema can silently never reach production (discovered when the daily
 * price-alerts cron crashed for 40+ days on a missing column). This
 * endpoint applies a fixed allowlist of idempotent statements so known
 * drift can be repaired from the admin panel without DB credentials.
 *
 * Every statement MUST be safe to run repeatedly (IF NOT EXISTS).
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const STATEMENTS: { id: string; sql: string }[] = [
  {
    id: "price-alert-last-notified-price",
    sql: `ALTER TABLE "PriceAlert" ADD COLUMN IF NOT EXISTS "lastNotifiedPrice" DOUBLE PRECISION`,
  },
  {
    id: "merchant-promo-image-url",
    sql: `ALTER TABLE "MerchantPromo" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT`,
  },
  {
    // Be Fibre moved from befibre.co.uk (now a dead holding page) to
    // be-fibre.co.uk — repair the tracked deal links imported before
    // the move. REPLACE never matches the hyphenated new domain, so
    // this is safe to run repeatedly.
    id: "plan-befibre-domain-fix",
    sql: `UPDATE "Plan" SET "affiliateUrl" = REPLACE("affiliateUrl", 'befibre.co.uk', 'be-fibre.co.uk') WHERE "affiliateUrl" LIKE '%befibre.co.uk%'`,
  },
  {
    // Retire deals no feed has confirmed in 45+ days: merchants
    // restructure product URLs (Be Fibre's be1000-900mbps-18 now 404s)
    // and prices go stale. Fresh feed imports touch updatedAt weekly,
    // so live deals are never affected; the expiry filter then hides
    // retired ones from listings, the sitemap, and outbound links.
    id: "plan-expire-stale-45d",
    sql: `UPDATE "Plan" SET "expiresAt" = NOW() WHERE "updatedAt" < NOW() - INTERVAL '45 days' AND ("expiresAt" IS NULL OR "expiresAt" > NOW())`,
  },
];

async function isAdmin(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  return user?.role === "admin";
}

export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const applied: string[] = [];
  const failed: { id: string; error: string }[] = [];
  for (const s of STATEMENTS) {
    try {
      await prisma.$executeRawUnsafe(s.sql);
      applied.push(s.id);
    } catch (err) {
      failed.push({
        id: s.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
  return NextResponse.json({ ok: failed.length === 0, applied, failed });
}
