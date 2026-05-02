/**
 * One-click unsubscribe endpoint.
 *
 * Supports RFC 8058 (List-Unsubscribe-Post: List-Unsubscribe=One-Click)
 * via POST, plus GET for browsers — though the GET path normally
 * arrives at /unsubscribe (a regular page) which calls this internally.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/email/unsubscribe";

export const dynamic = "force-dynamic";

async function deactivate(email: string, token: string): Promise<{ ok: boolean; error?: string }> {
  if (!email || !token) return { ok: false, error: "missing email or token" };
  if (!verifyUnsubscribeToken(email, token)) {
    return { ok: false, error: "invalid token" };
  }

  const normalised = email.toLowerCase().trim();

  // Deactivate newsletter subscription if present.
  await prisma.newsletterSubscriber
    .update({
      where: { email: normalised },
      data: { isActive: false },
    })
    .catch(() => {
      // Not subscribed? That's fine — idempotent.
    });

  // Also disable any user-account marketing alerts so a one-click unsub
  // covers ALL marketing email sources, not just the newsletter list.
  const user = await prisma.user.findUnique({
    where: { email: normalised },
    select: { id: true },
  });
  if (user) {
    await prisma.priceAlert.updateMany({
      where: { userId: user.id, isActive: true },
      data: { isActive: false },
    });
  }

  return { ok: true };
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email") || "";
  const token = url.searchParams.get("token") || "";
  const r = await deactivate(email, token);
  return NextResponse.json(r, { status: r.ok ? 200 : 400 });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email") || "";
  const token = url.searchParams.get("token") || "";
  await deactivate(email, token);
  // Always redirect to the public confirmation page — never leak whether
  // the email was actually subscribed (prevents enumeration).
  return NextResponse.redirect(`${url.origin}/unsubscribe?ok=1`);
}
