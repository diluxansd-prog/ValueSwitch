import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/send";
import { welcomeEmail } from "@/lib/email/templates/welcome";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const normalised = email.toLowerCase().trim();

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalised },
    });

    await prisma.newsletterSubscriber.upsert({
      where: { email: normalised },
      update: { isActive: true },
      create: { email: normalised },
    });

    // Only send welcome on first signup or after a re-subscribe — not on
    // every form re-submit by an already-active address.
    const shouldWelcome = !existing || existing.isActive === false;
    if (shouldWelcome) {
      const tmpl = welcomeEmail({ email: normalised, audience: "newsletter" });
      // Fire-and-forget so a Resend hiccup doesn't block the form submit.
      sendEmail({
        to: normalised,
        subject: tmpl.subject,
        html: tmpl.html,
        text: tmpl.text,
      }).catch((err) => console.error("[newsletter] welcome failed:", err));
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
