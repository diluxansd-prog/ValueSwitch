import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/seo";
import { getAllDealSlugs } from "@/lib/services/deal.service";
import { getAllProviderSlugs } from "@/lib/services/provider.service";
import { getAllGuideSlugs } from "@/lib/services/guide.service";
import { prisma } from "@/lib/prisma";
import { UK_CITIES } from "@/lib/seo/uk-cities";

// Regenerate on every request so newly-published deals/guides appear
// in search engines without requiring a redeploy.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/broadband`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/mobile`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/popular`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/offers`, changeFrequency: "daily", priority: 0.85 },
    { url: `${baseUrl}/providers`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/guides`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/for-advertisers`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/how-it-works`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/terms`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/accessibility`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const dealSlugs = await getAllDealSlugs();
  const dealPages: MetadataRoute.Sitemap = dealSlugs.map((slug) => ({
    url: `${baseUrl}/deals/${slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const providerSlugs = await getAllProviderSlugs();
  const providerPages: MetadataRoute.Sitemap = providerSlugs.map((slug) => ({
    url: `${baseUrl}/providers/${slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // Programmatic SEO: /best-deals/[brand] auto-pages
  const brandRows = await prisma.plan
    .findMany({
      where: { handsetModel: { not: null }, category: "mobile", provider: { isActive: true }, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      select: { handsetModel: true },
      distinct: ["handsetModel"],
    })
    .catch(() => [] as Array<{ handsetModel: string | null }>);
  const bestDealsPages: MetadataRoute.Sitemap = brandRows
    .map((b) => b.handsetModel!.toLowerCase())
    .filter((b) => b !== "other" && b !== "vodafone")
    .map((brand) => ({
      url: `${baseUrl}/best-deals/${encodeURIComponent(brand)}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  const guides = await getAllGuideSlugs();
  const guidePages: MetadataRoute.Sitemap = guides.map((g) => ({
    url: `${baseUrl}/guides/${g.category}/${g.slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  // Programmatic SIM-only landing pages — keep this list in sync with
  // FILTER_CONFIG in /sim-only/[filter]/page.tsx
  const simOnlyFilters = [
    "under-10",
    "under-15",
    "unlimited",
    "100gb-plus",
    "30-day-rolling",
  ];
  const simOnlyPages: MetadataRoute.Sitemap = simOnlyFilters.map((f) => ({
    url: `${baseUrl}/sim-only/${f}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Head-to-head comparison pages — keep in sync with MATCHUPS in
  // /compare/[matchup]/page.tsx
  const matchups = [
    "vodafone-vs-talkmobile",
    "voxi-vs-vodafone",
    "lebara-vs-talkmobile",
    "be-fibre-vs-bt-broadband",
  ];
  const matchupPages: MetadataRoute.Sitemap = matchups.map((m) => ({
    url: `${baseUrl}/compare/${m}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // City-level broadband pages — programmatic UK city footprint
  const cityBroadbandPages: MetadataRoute.Sitemap = UK_CITIES.map((c) => ({
    url: `${baseUrl}/broadband/${c.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  // Curated commercial-intent landing pages — keep in sync with PICKS
  // in /best/[type]/page.tsx
  const bestPicks = [
    "iphone-18-deals-uk",
    "cheapest-iphone-uk",
    "cheapest-samsung-galaxy-uk",
    "best-pixel-deal-uk",
    "unlimited-data-sim-uk",
    "no-credit-check-mobile-uk",
    "cheapest-broadband-uk",
  ];
  const bestPickPages: MetadataRoute.Sitemap = bestPicks.map((p) => ({
    url: `${baseUrl}/best/${p}`,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // Sub-category landing pages we've built
  const subcategoryPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/mobile/contracts`,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/mobile/sim-only`,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/refurbished`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/broadband/fibre`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/broadband/tv-packages`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
  ];

  const pages: MetadataRoute.Sitemap = [
    ...staticPages,
    ...subcategoryPages,
    ...dealPages,
    ...providerPages,
    ...bestDealsPages,
    ...simOnlyPages,
    ...matchupPages,
    ...cityBroadbandPages,
    ...bestPickPages,
    ...guidePages,
  ];
  return [...new Map(pages.map(page => [page.url, page])).values()];
}
