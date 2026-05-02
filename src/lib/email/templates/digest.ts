import { SITE_URL } from "../client";
import { emailShell, plainTextFooter, escapeHtml } from "./base";
import { formatPriceShort } from "@/lib/constants";

export interface DigestDeal {
  planId: string;
  planName: string;
  providerName: string;
  category: string;
  monthlyCost: number;
  affiliateUrl: string | null;
  badge?: string | null;
}

export interface DigestSection {
  category: string;
  heading: string;
  deals: DigestDeal[];
}

export function weeklyDigestEmail(args: {
  email: string;
  sections: DigestSection[];
  weekLabel: string;
}): { subject: string; html: string; text: string } {
  const totalDeals = args.sections.reduce((n, s) => n + s.deals.length, 0);
  const subject = `Top ${totalDeals} UK deals this week — ${args.weekLabel}`;

  const sectionHtml = args.sections
    .filter((s) => s.deals.length > 0)
    .map((s) => {
      const rows = s.deals
        .map((d) => {
          const url = d.affiliateUrl || `${SITE_URL}/deals/${d.planId}`;
          const badge = d.badge
            ? `<div style="display:inline-block; font-size:11px; font-weight:600; padding:2px 8px; border-radius:999px; background:#fef2f2; color:#b91c1c; margin-bottom:4px;">${escapeHtml(d.badge)}</div><br>`
            : "";
          return `
<tr>
  <td style="padding:10px 0; border-bottom:1px solid #f1f3f5;">
    ${badge}
    <div style="font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:0.04em;">${escapeHtml(d.providerName)}</div>
    <div style="font-size:15px; font-weight:600; color:#111; margin:2px 0 4px 0;">
      <a href="${url}" style="color:#111;">${escapeHtml(d.planName)}</a>
    </div>
    <div>
      <span style="font-size:18px; font-weight:700; color:#dc2626;">${formatPriceShort(d.monthlyCost)}</span>
      <span style="font-size:12px; color:#6b7280;">&nbsp;/mo</span>
      <a href="${url}" style="float:right; font-size:13px; font-weight:600; color:#dc2626;">View →</a>
    </div>
  </td>
</tr>`;
        })
        .join("");
      return `
<h2 style="font-size:16px; margin:24px 0 4px 0; color:#111; border-bottom:2px solid #dc2626; display:inline-block; padding-bottom:2px;">${escapeHtml(s.heading)}</h2>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${rows}</table>`;
    })
    .join("");

  const body = `
<h1 style="font-size:22px; margin:0 0 6px 0; color:#111;">Your weekly UK deals digest</h1>
<p style="margin:0 0 18px 0; color:#6b7280; font-size:14px;">Hand-picked from this week's price drops across mobile, broadband &amp; refurbished phones.</p>
${sectionHtml}
<p style="margin:24px 0 0 0; color:#6b7280; font-size:13px; line-height:1.5;">
  See every live deal at <a href="${SITE_URL}">valueswitch.co.uk</a>.
</p>`;

  const html = emailShell({
    preheader: `Top ${totalDeals} UK deals this week, hand-picked.`,
    body,
    recipientEmail: args.email,
  });

  const textLines: string[] = [subject, ""];
  for (const s of args.sections.filter((x) => x.deals.length > 0)) {
    textLines.push(s.heading.toUpperCase());
    for (const d of s.deals) {
      const url = d.affiliateUrl || `${SITE_URL}/deals/${d.planId}`;
      textLines.push(
        `- ${d.providerName} — ${d.planName}: ${formatPriceShort(d.monthlyCost)}/mo`
      );
      textLines.push(`  ${url}`);
    }
    textLines.push("");
  }
  textLines.push(`Browse all deals: ${SITE_URL}`);
  textLines.push(plainTextFooter(args.email));

  return { subject, html, text: textLines.join("\n") };
}
