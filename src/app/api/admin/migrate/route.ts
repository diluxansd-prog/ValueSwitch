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
