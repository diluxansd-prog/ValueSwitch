import crypto from "crypto";
import { SITE_URL } from "./client";

function getSecret(): string {
  const s = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "";
  if (!s) throw new Error("NEXTAUTH_SECRET required for unsubscribe tokens");
  return s;
}

export function makeUnsubscribeToken(email: string): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(email.toLowerCase().trim())
    .digest("hex")
    .slice(0, 32);
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = makeUnsubscribeToken(email);
  if (expected.length !== token.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}

export function unsubscribeUrl(email: string): string {
  const token = makeUnsubscribeToken(email);
  const e = encodeURIComponent(email);
  return `${SITE_URL}/api/newsletter/unsubscribe?email=${e}&token=${token}`;
}
