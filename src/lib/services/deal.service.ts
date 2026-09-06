import { prisma } from "@/lib/prisma";

export async function getPopularDeals(category?: string, limit = 6) {
  try {
    const where: any = {};
    if (category) where.category = category;
    where.OR = [{ isPromoted: true }, { isBestValue: true }, { isPopular: true }];

    return await prisma.plan.findMany({
      where,
      include: { provider: true },
      orderBy: [{ isPromoted: "desc" }, { isBestValue: "desc" }, { monthlyCost: "asc" }],
      take: limit,
    });
  } catch {
    return [];
  }
}

export async function getAllDealSlugs() {
  try {
    const plans = await prisma.plan.findMany({
      // Expired deals stay in the DB for history but leave the sitemap —
      // their merchant product pages often no longer exist.
      where: { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      select: { slug: true },
    });
    return plans.map((p) => p.slug);
  } catch {
    return [];
  }
}

export async function getDealBySlug(slug: string) {
  try {
    return await prisma.plan.findUnique({
      where: { slug },
      include: {
        provider: true,
        priceHistory: {
          orderBy: { recordedAt: "desc" },
          take: 10,
        },
      },
    });
  } catch {
    return null;
  }
}

export async function getSimilarDeals(planId: string, category: string, limit = 4) {
  try {
    return await prisma.plan.findMany({
      where: { category, id: { not: planId } },
      include: { provider: true },
      orderBy: { monthlyCost: "asc" },
      take: limit,
    });
  } catch {
    return [];
  }
}
