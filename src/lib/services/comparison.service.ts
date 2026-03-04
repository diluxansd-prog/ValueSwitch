import { prisma } from "@/lib/prisma";
import type { ComparisonQuery, ComparisonResult, PlanWithProvider } from "@/types/comparison";

export async function runComparison(query: ComparisonQuery): Promise<ComparisonResult> {
  // Build where clause
  const where: any = { category: query.category };
  if (query.subcategory) where.subcategory = query.subcategory;

  // Apply filters
  if (query.filters.minPrice) where.monthlyCost = { ...where.monthlyCost, gte: Number(query.filters.minPrice) };
  if (query.filters.maxPrice) where.monthlyCost = { ...where.monthlyCost, lte: Number(query.filters.maxPrice) };
  if (query.filters.provider) where.provider = { slug: query.filters.provider };
  if (query.filters.greenOnly === true) where.greenEnergy = true;
  if (query.filters.minSpeed) where.downloadSpeed = { gte: Number(query.filters.minSpeed) };
  if (query.filters.contractLength) where.contractLength = Number(query.filters.contractLength);

  // Build orderBy
  const orderByMap: Record<string, any> = {
    price: { monthlyCost: query.sortOrder },
    rating: { rating: query.sortOrder === "asc" ? "desc" : "asc" },
    popularity: { isPopular: "desc" },
    speed: { downloadSpeed: query.sortOrder === "asc" ? "desc" : "asc" },
  };
  const orderBy = orderByMap[query.sortBy] || { monthlyCost: "asc" };

  const [plans, totalCount] = await Promise.all([
    prisma.plan.findMany({
      where,
      include: { provider: true },
      orderBy,
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
    }),
    prisma.plan.count({ where }),
  ]);

  const allPrices = await prisma.plan.aggregate({
    where: { category: query.category },
    _min: { monthlyCost: true },
    _avg: { monthlyCost: true },
  });

  const transformedPlans: PlanWithProvider[] = plans.map((plan) => ({
    ...plan,
    features: plan.features ? JSON.parse(plan.features) : [],
    provider: {
      id: plan.provider.id,
      name: plan.provider.name,
      slug: plan.provider.slug,
      logo: plan.provider.logo,
      trustScore: plan.provider.trustScore,
      reviewCount: plan.provider.reviewCount,
    },
  }));

  return {
    plans: transformedPlans,
    totalCount,
    page: query.page,
    perPage: query.perPage,
    metadata: {
      cheapestPrice: allPrices._min.monthlyCost || 0,
      averagePrice: Math.round((allPrices._avg.monthlyCost || 0) * 100) / 100,
      totalProviders: new Set(plans.map((p) => p.providerId)).size,
    },
  };
}
