/**
 * Programmatic SEO route — auto-generates a "Best [brand] deals UK" page
 * for every handset brand we have plans for. One page per brand.
 *
 * Targets long-tail searches like:
 *   "best apple iphone deals uk 2026"
 *   "best samsung galaxy deals uk"
 *   "cheap google pixel contracts"
 *
 * Each page builds itself from live DB data, so prices stay fresh and
 * new brands automatically get pages when their plans are imported.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Smartphone, TrendingDown, Award, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ProviderLogo } from "@/components/shared/provider-logo";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/shared/json-ld";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/seo";

interface PageProps {
  params: Promise<{ brand: string }>;
}

// Brands we have plans for — generated at build time + revalidated hourly.
// Defensive: returns [] when DB isn't available (local builds without
// DATABASE_URL pointed at production), so build doesn't fail.  Pages
// still get rendered on-demand at request time thanks to dynamicParams.
export async function generateStaticParams() {
  try {
    const brands = await prisma.plan.findMany({
      where: { handsetModel: { not: null }, category: "mobile" },
      select: { handsetModel: true },
      distinct: ["handsetModel"],
    });
    return brands
      .map((b) => ({ brand: b.handsetModel!.toLowerCase() }))
      .filter((p) => p.brand !== "other" && p.brand !== "vodafone");
  } catch {
    return [];
  }
}

export const revalidate = 3600; // re-render hourly
export const dynamicParams = true; // allow on-demand pages for new brands

function brandFromSlug(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand } = await params;
  const display = brandFromSlug(brand);
  const year = new Date().getFullYear();
  const title = `Best ${display} Phone Deals UK ${year} — Cheapest Contracts & SIM-Free`;
  const description = `Compare the cheapest ${display} phone deals in the UK for ${year}. Real prices from Vodafone, Fonehouse, Mozillion and more, updated weekly. Find the best contract for you.`;
  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/best-deals/${brand.toLowerCase()}`,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${siteConfig.url}/best-deals/${brand.toLowerCase()}`,
    },
  };
}

export default async function BestBrandDealsPage({ params }: PageProps) {
  const { brand } = await params;
  const display = brandFromSlug(brand);

  const deals = await prisma.plan.findMany({
    where: {
      handsetModel: { equals: display, mode: "insensitive" },
      category: "mobile",
    },
    include: { provider: true },
    orderBy: { monthlyCost: "asc" },
    take: 30,
  });

  if (deals.length === 0) notFound();

  // Aggregate stats for credibility + dynamic copy
  const cheapest = deals[0];
  const avgPrice =
    deals.reduce((s, d) => s + d.monthlyCost, 0) / deals.length;
  const providerCount = new Set(deals.map((d) => d.provider.id)).size;
  const year = new Date().getFullYear();

  // Group deals into Cheapest / Mid / Premium tiers by price
  const tier = (price: number) =>
    price < avgPrice * 0.7 ? "value" : price > avgPrice * 1.3 ? "premium" : "mid";

  return (
    <div className="min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Mobile", url: `${siteConfig.url}/mobile` },
          {
            name: `Best ${display} Deals`,
            url: `${siteConfig.url}/best-deals/${brand.toLowerCase()}`,
          },
        ]}
      />
      <ArticleJsonLd
        title={`Best ${display} Phone Deals UK ${year}`}
        description={`Compare the cheapest ${display} phone deals in the UK. Real prices from ${providerCount} retailers.`}
        url={`${siteConfig.url}/best-deals/${brand.toLowerCase()}`}
        publishedAt={new Date()}
        updatedAt={new Date()}
        author="ValueSwitch Editorial"
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a365d] via-[#1e3a5f] to-[#2a4a7f] text-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Mobile", href: "/mobile" },
              { label: `Best ${display} Deals` },
            ]}
            className="mb-4 [&_a]:text-blue-200 [&_a:hover]:text-white [&_span]:text-blue-200 [&_[aria-current]]:text-white [&_svg]:text-blue-300"
          />
          <Badge className="mb-3 border-white/20 bg-white/10 text-white">
            <Smartphone className="size-3.5 mr-1.5" />
            {deals.length} live deals · {providerCount} retailers
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Best {display} phone deals UK {year}
          </h1>
          <p className="mt-4 text-lg text-blue-100 leading-relaxed max-w-3xl">
            We compare every {display} contract and SIM-free price across our
            partner retailers. Cheapest right now: <strong className="text-white">£{cheapest.monthlyCost.toFixed(2)}{cheapest.subcategory === "sim-free" ? " total" : "/mo"}</strong>
            {cheapest.dataAllowance ? ` for ${cheapest.dataAllowance} data` : ""}{" "}
            on {cheapest.provider.name}.
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <div className="grid grid-cols-3 gap-3 text-center sm:gap-6">
            <div>
              <p className="text-2xl font-bold">£{cheapest.monthlyCost.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Cheapest deal</p>
            </div>
            <div>
              <p className="text-2xl font-bold">£{avgPrice.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Avg price</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{providerCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Retailers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cheapest spotlight */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex items-center gap-2 mb-5">
          <Award className="size-5 text-amber-500" />
          <h2 className="text-xl font-bold">Our pick: cheapest {display} right now</h2>
        </div>
        <Card className="border-2 border-amber-500/30 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500/10 to-transparent px-5 py-2 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            🏆 Best price across {providerCount} retailers
          </div>
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <ProviderLogo
                name={cheapest.provider.name}
                slug={cheapest.provider.slug}
                logo={cheapest.provider.logo}
                size={56}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  {cheapest.provider.name}
                </p>
                <h3 className="text-lg font-semibold">{cheapest.name}</h3>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                  {cheapest.dataAllowance && <span>📊 {cheapest.dataAllowance}</span>}
                  {cheapest.contractLength != null && cheapest.contractLength > 0 && (
                    <span>📅 {cheapest.contractLength}-month</span>
                  )}
                  {cheapest.networkType && <span>📶 {cheapest.networkType}</span>}
                </div>
              </div>
              <div className="sm:text-right shrink-0">
                <p className="text-3xl font-bold">£{cheapest.monthlyCost.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {cheapest.subcategory === "sim-free" ? "total" : "a month"}
                </p>
              </div>
              <Button
                asChild
                className="bg-gradient-to-r from-[#1a365d] to-[#38a169] text-white"
              >
                <a
                  href={`/api/redirect?plan=${cheapest.id}&src=best_deals_${brand.toLowerCase()}`}
                  target="_blank"
                  rel="noopener noreferrer nofollow sponsored"
                >
                  Get this deal
                  <ArrowRight className="size-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Full deal list */}
      <section className="mx-auto max-w-5xl px-4 pb-10 sm:px-6">
        <h2 className="text-xl font-bold mb-5">All {deals.length} {display} deals</h2>
        <div className="space-y-3">
          {deals.map((d, i) => {
            const t = tier(d.monthlyCost);
            return (
              <Card
                key={d.id}
                className="border border-border/60 hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4 flex items-center gap-3 sm:gap-4">
                  <span className="text-xs font-mono text-muted-foreground w-6 text-center shrink-0">
                    #{i + 1}
                  </span>
                  <ProviderLogo
                    name={d.provider.name}
                    slug={d.provider.slug}
                    logo={d.provider.logo}
                    size={36}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{d.provider.name}</p>
                    <p className="text-sm font-semibold truncate">{d.name}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {t === "value" && (
                        <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300">
                          Best value
                        </Badge>
                      )}
                      {t === "premium" && (
                        <Badge variant="outline" className="text-[10px]">
                          Premium
                        </Badge>
                      )}
                      {d.dataAllowance && (
                        <span className="text-[11px] text-muted-foreground">
                          {d.dataAllowance}
                        </span>
                      )}
                      {d.contractLength != null && d.contractLength > 0 && (
                        <span className="text-[11px] text-muted-foreground">
                          {d.contractLength}m
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold">£{d.monthlyCost.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {d.subcategory === "sim-free" ? "total" : "/mo"}
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline" className="shrink-0">
                    <Link href={`/deals/${d.slug}`}>View</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Editorial copy block — content for SEO */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 prose prose-slate dark:prose-invert">
          <h2>How we compare {display} deals</h2>
          <p>
            Every {display} deal listed here comes directly from one of our{" "}
            {providerCount} verified retail partners via the Awin affiliate
            network. Prices update weekly from each retailer&apos;s product feed
            — we never quote stale or invented numbers.
          </p>
          <h3>What makes a good {display} contract?</h3>
          <ul>
            <li>
              <strong>Total cost over the contract</strong> matters more than the
              monthly price. A £20/mo 24-month contract costs £480; a £15/mo
              with £200 upfront also costs £560 — only the headline differs.
            </li>
            <li>
              <strong>Data allowance</strong> — most UK households use 8-15 GB a
              month. &quot;Unlimited&quot; deals make sense if you stream
              regularly off home Wi-Fi or commute by train.
            </li>
            <li>
              <strong>Contract length</strong> — 24-month locks in lower monthly
              prices but ties you in. Look for SIM-only rolling 30-day deals if
              you want flexibility.
            </li>
            <li>
              <strong>Network coverage</strong> — check <a href="https://checker.ofcom.org.uk/en-gb/mobile-coverage" target="_blank" rel="noopener noreferrer">Ofcom&apos;s coverage map</a> for your postcode before signing.
            </li>
          </ul>
          <h3>Cheapest {display} deal trends</h3>
          <p>
            Across our {deals.length} listed deals, the average monthly price
            for {display} is <strong>£{avgPrice.toFixed(2)}</strong>. Deals
            below £{(avgPrice * 0.7).toFixed(0)}/mo are flagged as &quot;Best
            value&quot; in the list above.
          </p>
        </div>
      </section>
    </div>
  );
}
