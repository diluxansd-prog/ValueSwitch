import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Is Postgres actually serving?
 *
 * Used by the middleware to answer crawlers with 503 instead of a page
 * that looks empty, which is what a database outage otherwise looks
 * like to Google. The result is held for 30s per instance so the probe
 * can't itself become load on the database.
 */
let cached: { ok: boolean; at: number } | null = null;
const TTL_MS = 30_000;

export async function GET() {
  const now = Date.now();
  if (cached && now - cached.at < TTL_MS) {
    return NextResponse.json(
      { ok: cached.ok, cached: true },
      { status: cached.ok ? 200 : 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  let ok = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    ok = true;
  } catch {
    ok = false;
  }
  cached = { ok, at: now };

  return NextResponse.json(
    { ok },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
