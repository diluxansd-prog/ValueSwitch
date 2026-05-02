import { SITE_URL } from "../client";
import { emailShell, plainTextFooter, escapeHtml } from "./base";

interface WelcomeArgs {
  email: string;
  name?: string | null;
  /** "newsletter" if signed up via newsletter form, "user" if registered an account */
  audience: "newsletter" | "user";
}

export function welcomeEmail(args: WelcomeArgs): { subject: string; html: string; text: string } {
  const greeting = args.name ? `Hi ${escapeHtml(args.name.split(" ")[0])},` : "Hi there,";
  const subject =
    args.audience === "user"
      ? "Welcome to ValueSwitch — let's find you a better deal"
      : "You're in. Here's what to do first.";

  const cta =
    args.audience === "user"
      ? `<a href="${SITE_URL}/dashboard" class="btn">Open your dashboard</a>`
      : `<a href="${SITE_URL}/mobile" class="btn">Browse mobile deals</a>`;

  const body = `
<h1 style="font-size:22px; margin:0 0 12px 0; color:#111;">${escapeHtml(subject)}</h1>
<p style="margin:0 0 14px 0; color:#374151; line-height:1.55;">${greeting}</p>
<p style="margin:0 0 14px 0; color:#374151; line-height:1.55;">
  Welcome to ValueSwitch. We compare UK mobile, broadband and refurbished phone deals from real merchants — Vodafone, Be Fibre, Mozillion, Fonehouse and more — and we're brutally honest about the trade-offs.
</p>
<p style="margin:0 0 18px 0; color:#374151; line-height:1.55;">
  Three things to try first:
</p>
<ul style="margin:0 0 22px 0; padding-left:20px; color:#374151; line-height:1.7;">
  <li><a href="${SITE_URL}/mobile">Mobile deals</a> — SIM-only, contracts, and refurbished handsets</li>
  <li><a href="${SITE_URL}/broadband">Broadband deals</a> — full-fibre from £29/mo with Be Fibre</li>
  <li><a href="${SITE_URL}/guides">Buyer guides</a> — straight talk on EU roaming, bad-credit contracts, refurbished vs new</li>
</ul>
<div style="text-align:center; margin:24px 0 8px 0;">${cta}</div>
<p style="margin:18px 0 0 0; color:#6b7280; font-size:13px; line-height:1.5;">
  Questions? Just reply — every message goes to a real person.
</p>`;

  const html = emailShell({
    preheader:
      args.audience === "user"
        ? "Your ValueSwitch account is ready."
        : "Your ValueSwitch newsletter is set up — start saving today.",
    body,
    recipientEmail: args.email,
  });

  const text = [
    subject,
    "",
    greeting,
    "",
    "Welcome to ValueSwitch. We compare UK mobile, broadband and refurbished phone deals from real merchants and we're brutally honest about the trade-offs.",
    "",
    "Three things to try first:",
    `- Mobile deals: ${SITE_URL}/mobile`,
    `- Broadband deals: ${SITE_URL}/broadband`,
    `- Buyer guides: ${SITE_URL}/guides`,
    "",
    args.audience === "user"
      ? `Your dashboard: ${SITE_URL}/dashboard`
      : `Browse deals: ${SITE_URL}`,
    "",
    "Questions? Just reply — every message goes to a real person.",
    plainTextFooter(args.email),
  ].join("\n");

  return { subject, html, text };
}
