import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/seo";
import { getAllDealSlugs } from "@/lib/services/deal.service";
import { getAllProviderSlugs } from "@/lib/services/provider.service";
import { getAllGuideSlugs } from "@/lib/services/guide.service";
import { prisma } from "@/lib/prisma";

// Regenerate on every request so newly-published deals/guides appear
// in search engines without requiring a redeploy.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/energy`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/broadband`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/mobile`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/insurance`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/finance`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/business`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/energy/compare`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/broadband/compare`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/mobile/compare`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/providers`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/guides`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/how-it-works`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/accessibility`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  const dealSlugs = await getAllDealSlugs();
  const dealPages: MetadataRoute.Sitemap = dealSlugs.map((slug) => ({
    url: `${baseUrl}/deals/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const providerSlugs = await getAllProviderSlugs();
  const providerPages: MetadataRoute.Sitemap = providerSlugs.map((slug) => ({
    url: `${baseUrl}/providers/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // Programmatic SEO: /best-deals/[brand] auto-pages
  const brandRows = await prisma.plan
    .findMany({
      where: { handsetModel: { not: null }, category: "mobile" },
      select: { handsetModel: true },
      distinct: ["handsetModel"],
    })
    .catch(() => [] as Array<{ handsetModel: string | null }>);
  const bestDealsPages: MetadataRoute.Sitemap = brandRows
    .map((b) => b.handsetModel!.toLowerCase())
    .filter((b) => b !== "other" && b !== "vodafone")
    .map((brand) => ({
      url: `${baseUrl}/best-deals/${brand}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  const guides = await getAllGuideSlugs();
  const guidePages: MetadataRoute.Sitemap = guides.map((g) => ({
    url: `${baseUrl}/guides/${g.category}/${g.slug}`,
    lastModified: new Date(),
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
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Head-to-head comparison pages — keep in sync with MATCHUPS in
  // /compare/[matchup]/page.tsx
  const matchups = [
    "vodafone-vs-talkmobile",
    "lebara-vs-talkmobile",
    "be-fibre-vs-bt-broadband",
  ];
  const matchupPages: MetadataRoute.Sitemap = matchups.map((m) => ({
    url: `${baseUrl}/compare/${m}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Sub-category landing pages we've built
  const subcategoryPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/mobile/contracts`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/mobile/sim-only`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/refurbished`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/broadband/fibre`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/broadband/tv-packages`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
  ];

  return [
    ...staticPages,
    ...subcategoryPages,
    ...dealPages,
    ...providerPages,
    ...bestDealsPages,
    ...simOnlyPages,
    ...matchupPages,
    ...guidePages,
  ];
}
