import { prisma } from "@/lib/prisma";

/**
 * Most-clicked deals, from this site's own traffic.
 *
 * Every outbound affiliate click goes through /api/redirect, which writes
 * a ClickEvent. Aggregating those gives a genuinely popular list rather
 * than an editorially "promoted" one.
 *
 * Honesty rule: we only present the list as popularity data when there
 * are enough real clicks behind it. Below that threshold the caller gets
 * `basis: "editorial"` and should label the section accordingly.
 */

export interface TrendingDeal {
  id: string;
  slug: string;
  name: string;
  monthlyCost: number;
  setupFee: number;
  category: string;
  subcategory: string | null;
  dataAllowance: string | null;
  contractLength: number | null;
  imageUrl: string | null;
  provider: { name: string; slug: string; logo: string | null };
  /** Clicks counted in the window (0 when the list is editorial) */
  clicks: number;
}

export interface TrendingResult {
  deals: TrendingDeal[];
  basis: "clicks" | "editorial";
  /** Total clicks across the returned deals, for the "based on N clicks" line */
  totalClicks: number;
  windowDays: number;
}

/** Below this many clicks the data is too thin to call anything popular. */
const MIN_CLICKS_FOR_POPULARITY = 12;

export async function getTrendingDeals(
  limit = 12,
  windowDays = 30,
  category?: string
): Promise<TrendingResult> {
  const since = new Date(Date.now() - windowDays * 86_400_000);
  const empty: TrendingResult = {
    deals: [],
    basis: "editorial",
    totalClicks: 0,
    windowDays,
  };

  try {
    const grouped = await prisma.clickEvent.groupBy({
      by: ["planId"],
      where: { createdAt: { gte: since } },
      _count: { planId: true },
      orderBy: { _count: { planId: "desc" } },
      take: limit * 4, // over-fetch: some plans will have expired since
    });

    const counts = new Map(grouped.map((g) => [g.planId, g._count.planId]));
    const totalClicks = [...counts.values()].reduce((a, b) => a + b, 0);

    const live =
      counts.size > 0
        ? await prisma.plan.findMany({
            where: {
              id: { in: [...counts.keys()] },
              ...(category ? { category } : {}),
              provider: { isActive: true },
              OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
            include: {
              provider: { select: { name: true, slug: true, logo: true } },
            },
          })
        : [];

    const clicked: TrendingDeal[] = live
      .map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        monthlyCost: p.monthlyCost,
        setupFee: p.setupFee,
        category: p.category,
        subcategory: p.subcategory,
        dataAllowance: p.dataAllowance,
        contractLength: p.contractLength,
        imageUrl: p.imageUrl,
        provider: p.provider,
        clicks: counts.get(p.id) ?? 0,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, limit);

    const clicksShown = clicked.reduce((sum, d) => sum + d.clicks, 0);
    if (clicksShown >= MIN_CLICKS_FOR_POPULARITY && clicked.length >= 3) {
      return {
        deals: clicked,
        basis: "clicks",
        totalClicks: clicksShown,
        windowDays,
      };
    }

    // Not enough real interest yet — fall back to cheapest live deals so
    // the page still helps, but the caller labels it as an editorial pick.
    const fallback = await prisma.plan.findMany({
      where: {
        ...(category ? { category } : {}),
        provider: { isActive: true },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      include: { provider: { select: { name: true, slug: true, logo: true } } },
      orderBy: { monthlyCost: "asc" },
      take: limit,
    });

    return {
      deals: fallback.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        monthlyCost: p.monthlyCost,
        setupFee: p.setupFee,
        category: p.category,
        subcategory: p.subcategory,
        dataAllowance: p.dataAllowance,
        contractLength: p.contractLength,
        imageUrl: p.imageUrl,
        provider: p.provider,
        clicks: 0,
      })),
      basis: "editorial",
      totalClicks,
      windowDays,
    };
  } catch {
    return empty;
  }
}
