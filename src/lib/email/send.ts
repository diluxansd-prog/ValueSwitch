import { getResendClient, FROM_ADDRESS } from "./client";
import { unsubscribeUrl } from "./unsubscribe";

export interface SendResult {
  ok: boolean;
  id?: string;
  error?: string;
  skipped?: "no-api-key";
}

export interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail(args: SendArgs): Promise<SendResult> {
  const client = getResendClient();
  if (!client) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[email] (no RESEND_API_KEY) would send to ${args.to}: ${args.subject}`);
    }
    return { ok: false, skipped: "no-api-key" };
  }

  try {
    const { data, error } = await client.emails.send({
      from: FROM_ADDRESS,
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
      replyTo: args.replyTo,
      headers: {
        // RFC 8058 one-click unsubscribe
        "List-Unsubscribe": `<${unsubscribeUrl(args.to)}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    if (error) {
      console.error("[email] resend error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true, id: data?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "send failed";
    console.error("[email] send failed:", msg);
    return { ok: false, error: msg };
  }
}

/** Throttled batch sender — Resend free tier = 2 req/s. */
export async function sendBatch(
  msgs: SendArgs[],
  delayMs = 600
): Promise<{ sent: number; failed: number; skipped: number }> {
  let sent = 0;
  let failed = 0;
  let skipped = 0;
  for (const m of msgs) {
    const r = await sendEmail(m);
    if (r.ok) sent++;
    else if (r.skipped) skipped++;
    else failed++;
    if (delayMs > 0) await new Promise((res) => setTimeout(res, delayMs));
  }
  return { sent, failed, skipped };
}
