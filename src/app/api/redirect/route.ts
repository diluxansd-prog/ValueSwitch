/**
 * Affiliate click tracker + redirect.
 *
 * Routes:
 *   GET /api/redirect?plan=<planId>&src=<label>
 *     → uses the plan's stored affiliateUrl (already an Awin cread link)
 *     → logs a ClickEvent for analytics
 *     → appends `clickref=<src>` if provided for campaign attribution
 *
 *   GET /api/redirect?url=<encoded-merchant-url>&src=<label>
 *     → auto-detects merchant from URL and wraps with Awin tracking
 *     → useful for ad-hoc links (banners, social posts, emails)
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { wrapWithAffiliate } from "@/lib/affiliate";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const planId = url.searchParams.get("plan");
    const adhocUrl = url.searchParams.get("url");
    const clickref = url.searchParams.get("src") || undefined;

    // Mode 1: redirect via a specific plan
    if (planId) {
      const plan = await prisma.plan.findUnique({
        where: { id: planId },
        include: {
          provider: {
            select: { id: true, website: true, name: true, slug: true },
          },
        },
      });

      if (!plan) {
        return NextResponse.redirect(new URL("/", req.url));
      }

      // Log the click
      const session = await auth();
      await prisma.clickEvent
        .create({
          data: {
            planId: plan.id,
            providerId: plan.provider.id,
            userId: session?.user?.id || null,
            referrer: req.headers.get("referer") || null,
          },
        })
        .catch(() => null); // don't fail the redirect if logging fails

      // Prefer the pre-built affiliate URL (already an Awin cread link
      // pointing to the exact merchant product page). If missing, fall
      // back to auto-wrapping the provider website.
      let targetUrl =
        plan.affiliateUrl ||
        (plan.provider.website
          ? wrapWithAffiliate(plan.provider.website, clickref)
          : null);

      if (!targetUrl) {
        return NextResponse.redirect(new URL("/", req.url));
      }

      // If a clickref was provided and the stored URL doesn't already
      // have one, append it.
      if (clickref && !targetUrl.includes("clickref=")) {
        const u = new URL(targetUrl);
        u.searchParams.set("clickref", clickref);
        targetUrl = u.toString();
      }

      return NextResponse.redirect(targetUrl);
    }

    // Mode 2: ad-hoc URL
    if (adhocUrl) {
      const wrapped = wrapWithAffiliate(adhocUrl, clickref);
      return NextResponse.redirect(wrapped);
    }

    return NextResponse.redirect(new URL("/", req.url));
  } catch {
    return NextResponse.redirect(new URL("/", req.url));
  }
}
