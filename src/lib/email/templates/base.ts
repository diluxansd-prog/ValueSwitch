import { COMPANY } from "@/lib/constants";
import { SITE_URL } from "../client";
import { unsubscribeUrl } from "../unsubscribe";

interface ShellOptions {
  preheader?: string;
  body: string;
  recipientEmail: string;
  showUnsubscribe?: boolean;
}

export function emailShell({
  preheader = "",
  body,
  recipientEmail,
  showUnsubscribe = true,
}: ShellOptions): string {
  const unsub = showUnsubscribe ? unsubscribeUrl(recipientEmail) : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>ValueSwitch</title>
<style>
  body { margin:0; padding:0; background:#f5f6f8; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; color:#1a1a1a; }
  .preheader { display:none !important; visibility:hidden; opacity:0; height:0; width:0; overflow:hidden; }
  a { color:#dc2626; text-decoration:none; }
  .btn { display:inline-block; padding:12px 24px; background:#dc2626; color:#fff !important; border-radius:8px; font-weight:600; }
  .card { background:#fff; border:1px solid #e5e7eb; border-radius:10px; padding:16px; margin:8px 0; }
  @media (max-width: 600px) {
    .container { width:100% !important; padding:0 16px !important; }
  }
</style>
</head>
<body>
<span class="preheader">${escapeHtml(preheader)}</span>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f6f8;">
  <tr><td align="center" style="padding:24px 16px;">
    <table role="presentation" class="container" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;">
      <tr><td style="padding:8px 0 16px 0;">
        <a href="${SITE_URL}" style="font-size:22px; font-weight:800; color:#dc2626; letter-spacing:-0.02em;">ValueSwitch</a>
        <span style="color:#6b7280; font-size:13px; margin-left:6px;">— Compare &amp; Save</span>
      </td></tr>
      <tr><td style="background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:28px 28px 24px 28px;">
        ${body}
      </td></tr>
      <tr><td style="padding:20px 6px 8px 6px; color:#6b7280; font-size:12px; line-height:1.5;">
        ${COMPANY.legalName} — Companies House #${COMPANY.companyNumber}<br>
        ${COMPANY.address.full}<br>
        <a href="${SITE_URL}" style="color:#6b7280;">${new URL(SITE_URL).host}</a>
        ${unsub ? ` &nbsp;·&nbsp; <a href="${unsub}" style="color:#6b7280;">Unsubscribe</a>` : ""}
        <br><br>
        <span style="color:#9ca3af;">ValueSwitch is an independent comparison service. Some links may be affiliate links — this never affects the deals shown.</span>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function plainTextFooter(email: string): string {
  return [
    "",
    "—",
    `${COMPANY.legalName} — Companies House #${COMPANY.companyNumber}`,
    COMPANY.address.full,
    SITE_URL,
    `Unsubscribe: ${unsubscribeUrl(email)}`,
  ].join("\n");
}
