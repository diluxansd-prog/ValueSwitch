import { prisma } from "@/lib/prisma";

export async function getPopularDeals(category?: string, limit = 6) {
  const where: any = {};
  if (category) where.category = category;
  where.OR = [{ isPromoted: true }, { isBestValue: true }, { isPopular: true }];

  return prisma.plan.findMany({
    where,
    include: { provider: true },
    orderBy: [{ isPromoted: "desc" }, { isBestValue: "desc" }, { monthlyCost: "asc" }],
    take: limit,
  });
}

export async function getDealBySlug(slug: string) {
  return prisma.plan.findUnique({
    where: { slug },
    include: { provider: true },
  });
}

export async function getSimilarDeals(planId: string, category: string, limit = 4) {
  return prisma.plan.findMany({
    where: { category, id: { not: planId } },
    include: { provider: true },
    orderBy: { monthlyCost: "asc" },
    take: limit,
  });
}
