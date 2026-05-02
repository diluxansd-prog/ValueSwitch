import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reviewSchema = z.object({
  providerSlug: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  content: z.string().min(10).max(2000),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "You need to be signed in to leave a review" },
      { status: 401 }
    );
  }

  try {
    const parsed = reviewSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please fill all required fields", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const provider = await prisma.provider.findUnique({
      where: { slug: parsed.data.providerSlug },
      select: { id: true },
    });
    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    // Upsert: one review per user per provider (latest wins)
    const review = await prisma.userReview.upsert({
      where: {
        userId_providerId: {
          userId: session.user.id,
          providerId: provider.id,
        },
      },
      update: {
        rating: parsed.data.rating,
        title: parsed.data.title || null,
        content: parsed.data.content,
      },
      create: {
        userId: session.user.id,
        providerId: provider.id,
        rating: parsed.data.rating,
        title: parsed.data.title || null,
        content: parsed.data.content,
      },
    });

    // Recompute aggregate trust score from real reviews
    const all = await prisma.userReview.findMany({
      where: { providerId: provider.id },
      select: { rating: true },
    });
    const avg = all.length
      ? all.reduce((s, r) => s + r.rating, 0) / all.length
      : null;
    await prisma.provider.update({
      where: { id: provider.id },
      data: {
        trustScore: avg ? Math.round(avg * 10) / 10 : null,
        reviewCount: all.length,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (err) {
    console.error("[reviews] error:", err);
    return NextResponse.json(
      { error: "Failed to save review" },
      { status: 500 }
    );
  }
}
