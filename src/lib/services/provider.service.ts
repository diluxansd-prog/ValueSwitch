import { prisma } from "@/lib/prisma";

export async function getProviders(category?: string) {
  try {
    const where: any = { isActive: true };
    if (category) where.categories = { contains: category };

    const providers = await prisma.provider.findMany({
      where,
      include: { _count: { select: { plans: true } } },
      orderBy: { trustScore: "desc" },
    });

    return providers.map((p) => ({
      ...p,
      categories: p.categories.split(",").map((c: string) => c.trim()),
      planCount: p._count.plans,
    }));
  } catch {
    return [];
  }
}

export async function getAllProviderSlugs() {
  try {
    const providers = await prisma.provider.findMany({
      select: { slug: true },
    });
    return providers.map((p) => p.slug);
  } catch {
    return [];
  }
}

export async function getProviderBySlug(slug: string) {
  try {
    const provider = await prisma.provider.findUnique({
      where: { slug },
      include: {
        plans: { orderBy: { monthlyCost: "asc" }, take: 20 },
        reviews: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: { select: { plans: true, reviews: true } },
      },
    });
    return provider;
  } catch {
    return null;
  }
}
