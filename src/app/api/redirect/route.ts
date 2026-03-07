import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const planId = url.searchParams.get("plan");

    if (!planId) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: { provider: { select: { id: true, website: true, name: true } } },
    });

    if (!plan || !plan.provider.website) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Track the click
    const session = await auth();
    await prisma.clickEvent.create({
      data: {
        planId: plan.id,
        providerId: plan.provider.id,
        userId: session?.user?.id || null,
        referrer: req.headers.get("referer") || null,
      },
    });

    // Build affiliate URL with tracking params
    const targetUrl = new URL(plan.provider.website);
    targetUrl.searchParams.set("utm_source", "valueswitch");
    targetUrl.searchParams.set("utm_medium", "comparison");
    targetUrl.searchParams.set("utm_campaign", plan.category);

    return NextResponse.redirect(targetUrl.toString());
  } catch {
    return NextResponse.redirect(new URL("/", req.url));
  }
}
