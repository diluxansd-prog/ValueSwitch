import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRecentDbStatus } from "@/lib/db-status";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Is Postgres serving? Used by the middleware to answer crawlers with a
 * 503 instead of an empty-looking page during an outage.
 *
 * Answers from the outcome of queries the app has already run. It only
 * opens its own connection when nothing has been observed recently —
 * otherwise this endpoint would keep the compute awake permanently and
 * bill for a database nobody is using.
 */
export async function GET() {
  const seen = getRecentDbStatus();
  if (seen) {
    return NextResponse.json(
      { ok: seen.ok, source: "observed", ageMs: Date.now() - seen.at },
      { status: seen.ok ? 200 : 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  // Nothing recent to go on: a quiet site is healthy until proven
  // otherwise, so don't wake the database just to ask.
  return NextResponse.json(
    { ok: true, source: "idle" },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}

/** Explicit probe for manual checks — opens a real connection. */
export async function POST() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, source: "probe" });
  } catch {
    return NextResponse.json({ ok: false, source: "probe" }, { status: 503 });
  }
}
