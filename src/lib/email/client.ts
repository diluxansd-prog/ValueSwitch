import { Resend } from "resend";

let cached: Resend | null = null;

export function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (cached) return cached;
  cached = new Resend(key);
  return cached;
}

export const FROM_ADDRESS =
  process.env.EMAIL_FROM || "ValueSwitch <hello@valueswitch.co.uk>";

export const SITE_URL =
  process.env.NEXTAUTH_URL || "https://valueswitch.co.uk";
