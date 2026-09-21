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
  {
    // Be Fibre's legacy catalogue (imported pre-Sept 2026) survived the
    // age sweep because something touched updatedAt, but every product
    // URL from that import 404s on their rebuilt site and the prices
    // are months out of date. Retire by createdAt so future fresh
    // imports are never affected.
    id: "plan-expire-befibre-legacy",
    // updatedAt guard: never re-retire a row a feed has since re-confirmed
    sql: `UPDATE "Plan" SET "expiresAt" = NOW() WHERE "providerId" IN (SELECT "id" FROM "Provider" WHERE "slug" = 'be-fibre') AND "createdAt" < '2026-09-01' AND "updatedAt" < '2026-09-07' AND ("expiresAt" IS NULL OR "expiresAt" > NOW())`,
  },
  {
    // Repair: before the importer cleared expiresAt on re-import, deals
    // the stale sweep retired stayed hidden even after a feed confirmed
    // them again. Raw-SQL expiry doesn't touch updatedAt, so any row
    // updated after it was expired was re-confirmed by a feed.
    id: "plan-unexpire-reconfirmed",
    sql: `UPDATE "Plan" SET "expiresAt" = NULL WHERE "expiresAt" IS NOT NULL AND "updatedAt" > "expiresAt"`,
  },
  {
    // Phone contracts whose whole-term cost can't cover the phone ("iPhone
    // 17 Pro Max" at £9/mo, no upfront) — mis-parsed feed rows. Mirrors
    // isAirtimeOnlyRow in src/lib/deal-quality.ts; the importer now skips
    // them, so they won't come back.
    id: "plan-expire-airtime-only-handsets",
    sql: `UPDATE "Plan" SET "expiresAt" = NOW()
      WHERE "expiresAt" IS NULL
        AND "category" = 'mobile'
        AND COALESCE("subcategory", '') NOT IN ('sim-only', 'sim-free')
        AND "name" ~* '\\m(iphone|galaxy|pixel|xperia|oneplus|redmi|xiaomi|motorola|moto g|nokia|honor|oppo|vivo|huawei|nothing phone)\\M'
        AND ("monthlyCost" * COALESCE(NULLIF("contractLength", 0), 1) + COALESCE("setupFee", 0)) <
          CASE
            WHEN "name" ~* '(refurb|pre-owned|preowned|used)' THEN 200
            WHEN "name" ~* '(pro max|ultra|fold|2tb)' THEN 900
            WHEN "name" ~* '(pro\\M|plus\\M|1tb)' THEN 700
            ELSE 400
          END`,
  },
  {
    // Vodafone's feed ships UTF-8 decoded as Latin-1 ("at Â£10").
    id: "plan-fix-mojibake-pound",
    sql: `UPDATE "Plan" SET "name" = REPLACE("name", 'Â£', '£'),
      "description" = REPLACE("description", 'Â£', '£')
      WHERE "name" LIKE '%Â£%' OR "description" LIKE '%Â£%'`,
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
      const rows = await prisma.$executeRawUnsafe(s.sql);
      applied.push(`${s.id}:${rows}`);
    } catch (err) {
      failed.push({
        id: s.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
  return NextResponse.json({ ok: failed.length === 0, applied, failed });
}
