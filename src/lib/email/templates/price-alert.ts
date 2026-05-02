import { SITE_URL } from "../client";
import { emailShell, plainTextFooter, escapeHtml } from "./base";
import { formatPriceShort } from "@/lib/constants";

export interface AlertMatch {
  planId: string;
  planName: string;
  providerName: string;
  category: string;
  newPrice: number;
  previousPrice: number | null;
  affiliateUrl: string | null;
  imageUrl: string | null;
}

export function priceAlertEmail(args: {
  email: string;
  name?: string | null;
  matches: AlertMatch[];
  targetPrice: number | null;
  category: string;
}): { subject: string; html: string; text: string } {
  const top = args.matches[0];
  const greeting = args.name ? `Hi ${escapeHtml(args.name.split(" ")[0])},` : "Hi,";
  const subject =
    args.matches.length === 1
      ? `Price drop: ${top.providerName} ${top.planName} — now ${formatPriceShort(top.newPrice)}/mo`
      : `${args.matches.length} ${args.category} deals just hit your target`;

  const cards = args.matches
    .map((m) => {
      const drop =
        m.previousPrice && m.previousPrice > m.newPrice
          ? Math.round(((m.previousPrice - m.newPrice) / m.previousPrice) * 100)
          : 0;
      const ctaUrl = m.affiliateUrl || `${SITE_URL}/deals/${m.planId}`;
      return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:10px 0; border:1px solid #e5e7eb; border-radius:10px;">
  <tr>
    <td style="padding:14px 16px;">
      <div style="font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:0.04em;">${escapeHtml(m.providerName)}</div>
      <div style="font-size:16px; font-weight:600; color:#111; margin:2px 0 8px 0;">${escapeHtml(m.planName)}</div>
      <div style="display:inline-block;">
        <span style="font-size:22px; font-weight:700; color:#dc2626;">${formatPriceShort(m.newPrice)}</span>
        <span style="font-size:13px; color:#6b7280;">&nbsp;/mo</span>
        ${m.previousPrice && m.previousPrice > m.newPrice ? `<span style="font-size:13px; color:#9ca3af; text-decoration:line-through; margin-left:8px;">${formatPriceShort(m.previousPrice)}</span>` : ""}
        ${drop > 0 ? `<span style="font-size:12px; font-weight:600; color:#15803d; margin-left:8px;">−${drop}%</span>` : ""}
      </div>
      <div style="margin-top:14px;">
        <a href="${ctaUrl}" class="btn" style="display:inline-block; padding:10px 18px; background:#dc2626; color:#fff !important; border-radius:8px; font-weight:600; font-size:14px;">View deal</a>
      </div>
    </td>
  </tr>
</table>`;
    })
    .join("");

  const targetLine =
    args.targetPrice != null
      ? `<p style="margin:0 0 14px 0; color:#374151; line-height:1.55;">A ${escapeHtml(args.category)} deal just dropped at or below your target of <strong>${formatPriceShort(args.targetPrice)}/mo</strong>:</p>`
      : `<p style="margin:0 0 14px 0; color:#374151; line-height:1.55;">A ${escapeHtml(args.category)} deal you're watching just dropped in price:</p>`;

  const body = `
<h1 style="font-size:22px; margin:0 0 12px 0; color:#111;">Your price alert just hit</h1>
<p style="margin:0 0 12px 0; color:#374151; line-height:1.55;">${greeting}</p>
${targetLine}
${cards}
<p style="margin:18px 0 0 0; color:#6b7280; font-size:13px; line-height:1.5;">
  Manage or pause your alerts in <a href="${SITE_URL}/dashboard/alerts">your dashboard</a>.
</p>`;

  const html = emailShell({
    preheader: subject,
    body,
    recipientEmail: args.email,
  });

  const text = [
    subject,
    "",
    greeting,
    "",
    args.targetPrice != null
      ? `${args.matches.length} ${args.category} deal(s) just dropped at or below your target of ${formatPriceShort(args.targetPrice)}/mo:`
      : `${args.matches.length} ${args.category} deal(s) you're watching just dropped:`,
    "",
    ...args.matches.map(
      (m) =>
        `- ${m.providerName} — ${m.planName}: ${formatPriceShort(m.newPrice)}/mo${m.previousPrice && m.previousPrice > m.newPrice ? ` (was ${formatPriceShort(m.previousPrice)})` : ""}\n  ${m.affiliateUrl || `${SITE_URL}/deals/${m.planId}`}`
    ),
    "",
    `Manage alerts: ${SITE_URL}/dashboard/alerts`,
    plainTextFooter(args.email),
  ].join("\n");

  return { subject, html, text };
}
