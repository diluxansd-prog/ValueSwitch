import type { Metadata } from "next";
import Link from "next/link";
import { Flame, MousePointerClick, ArrowRight, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProviderLogo } from "@/components/shared/provider-logo";
import { getTrendingDeals } from "@/lib/services/trending.service";
import { getDisplayOffers } from "@/lib/offers-live";
import { getBrandColor } from "@/config/brand-colors";
import { siteConfig } from "@/config/seo";
import {
  BreadcrumbJsonLd,
  ItemListJsonLd,
} from "@/components/shared/json-ld";

/**
 * /popular — the deals our own visitors click most, from ClickEvent data
 * (every outbound affiliate click is logged by /api/redirect). Falls back
 * to cheapest-first with honest labelling until there's enough traffic.
 */

export const metadata: Metadata = {
  title: "Most Popular Deals — What Our Visitors Choose",
  description:
    "The mobile and broadband deals ValueSwitch visitors click most this month, ranked from our own traffic — plus the newest voucher codes from our partners.",
  alternates: { canonical: `${siteConfig.url}/popular` },
  openGraph: {
    type: "website",
    title: "Most Popular Deals — What Our Visitors Choose",
    description:
      "Ranked from real clicks on ValueSwitch, updated hourly.",
    url: `${siteConfig.url}/popular`,
  },
};

export const revalidate = 3600;

export default async function PopularPage() {
  const [trending, display] = await Promise.all([
    getTrendingDeals(12, 30),
    getDisplayOffers().catch(() => ({ offers: [], note: "error" })),
  ]);
  const { deals, basis, totalClicks, windowDays } = trending;
  // Newest promotions first — the offers feed is already sorted that way.
  const newestOffers = display.offers.slice(0, 6);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Most popular", url: `${siteConfig.url}/popular` },
        ]}
      />
      {deals.length > 0 && (
        <ItemListJsonLd
          name="Most popular deals on ValueSwitch"
          url={`${siteConfig.url}/popular`}
          items={deals.map((d) => ({
            name: `${d.provider.name} — ${d.name}`,
            url: `${siteConfig.url}/deals/${d.slug}`,
            price: d.monthlyCost,
          }))}
        />
      )}

      <section className="page-banner relative overflow-hidden bg-gradient-to-br from-[#7c2d12] via-[#b45309] to-[#1a365d] text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <Badge className="mb-4 bg-white/15 text-white border-0 backdrop-blur-sm">
            <Flame className="size-3.5 mr-1" />
            {basis === "clicks" ? "Ranked by real clicks" : "Best value right now"}
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl">
            Most popular deals
          </h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-white/80 leading-relaxed">
            {basis === "clicks" ? (
              <>
                The deals ValueSwitch visitors clicked through to most in the
                last {windowDays} days — {totalClicks.toLocaleString()} clicks
                counted, updated hourly.
              </>
            ) : (
              <>
                We rank this page by what visitors actually click. There
                aren&apos;t enough clicks yet this month to call a winner, so
                here are the lowest-priced live deals instead.
              </>
            )}
          </p>
        </div>
      </section>

      {/* Newest offers first */}
      {newestOffers.length > 0 && (
        <section className="bg-slate-50 dark:bg-slate-950 border-b border-border/40">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="section-eyebrow">Just landed</p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Newest promotions
                </h2>
              </div>
              <Link
                href="/offers"
                className="inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4"
              >
                All offers <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {newestOffers.map((o) => {
                const brand = getBrandColor(o.merchant);
                const grad = brand
                  ? `linear-gradient(135deg, ${brand.from}, ${brand.to})`
                  : "linear-gradient(135deg, #1a365d, #38a169)";
                return (
                  <a
                    key={o.id}
                    href={o.href}
                    target="_blank"
                    rel="noopener noreferrer nofollow sponsored"
                    className="group relative overflow-hidden rounded-2xl border bg-card p-4 pl-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1"
                      style={{ background: grad }}
                    />
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {o.merchantName}
                      </p>
                      <span
                        className="rounded-md px-2 py-0.5 text-[10px] font-extrabold text-white"
                        style={{ background: grad }}
                      >
                        {o.badge}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-bold leading-snug">
                      {o.title}
                    </p>
                    {o.code && (
                      <p className="mt-2 inline-block rounded border border-dashed px-2 py-0.5 font-mono text-xs font-bold">
                        {o.code}
                      </p>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Ranked deals */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="mb-7">
            <p className="section-eyebrow">
              {basis === "clicks" ? "From our traffic" : "Lowest prices live"}
            </p>
            <h2 className="mt-2 text-3xl font-semibold">
              {basis === "clicks"
                ? `Top ${deals.length} this month`
                : "Cheapest live deals"}
            </h2>
          </div>

          {deals.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed py-16 text-center">
              <p className="text-lg font-semibold">No deals to rank yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Our next feed refresh runs on Sunday — or browse{" "}
                <Link href="/offers" className="underline">
                  live offers
                </Link>
                .
              </p>
            </div>
          ) : (
            <ol className="space-y-3">
              {deals.map((d, i) => {
                const brand = getBrandColor(d.provider.slug);
                const grad = brand
                  ? `linear-gradient(135deg, ${brand.from}, ${brand.to})`
                  : "linear-gradient(135deg, #1a365d, #38a169)";
                return (
                  <li
                    key={d.id}
                    className="group rounded-2xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white shadow-md" style={{ background: grad }}>
                        {i + 1}
                      </div>
                      <div className="flex min-w-0 items-center gap-3 sm:w-[320px] sm:shrink-0">
                        <ProviderLogo
                          name={d.provider.name}
                          slug={d.provider.slug}
                          logo={d.provider.logo}
                          size={40}
                        />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {d.provider.name}
                          </p>
                          <h3 className="mt-0.5 line-clamp-2 text-sm font-bold leading-tight">
                            {d.name.replace(/ - £[\d.]+\/mo.*/, "")}
                          </h3>
                        </div>
                      </div>
                      {basis === "clicks" && (
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground sm:flex-1">
                          <MousePointerClick className="size-3.5" />
                          {d.clicks} click{d.clicks === 1 ? "" : "s"} this month
                        </p>
                      )}
                      {d.dataAllowance && basis !== "clicks" && (
                        <p className="text-sm text-muted-foreground sm:flex-1">
                          {d.dataAllowance}
                        </p>
                      )}
                      <div className="sm:shrink-0 sm:text-right">
                        <span className="text-2xl font-extrabold tabular-nums">
                          £{d.monthlyCost.toFixed(2)}
                        </span>
                        <span className="ml-0.5 text-xs text-muted-foreground">
                          /mo
                        </span>
                      </div>
                      <Button
                        asChild
                        className="border-0 bg-gradient-to-r from-[#1a365d] to-[#38a169] px-6 font-semibold text-white shadow-md hover:from-[#2a4a7f] hover:to-[#48bb78] sm:shrink-0"
                      >
                        <Link href={`/deals/${d.slug}`}>
                          View deal <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            {basis === "clicks"
              ? "Popularity is measured from outbound clicks on this site over the last 30 days. It shows what other visitors chose to look at — not which deal is best for you, and not confirmed purchases."
              : "Ranked by lowest monthly price among live listings. Once this month has enough click data, this page switches to ranking by what visitors actually choose."}
          </p>
        </div>
      </section>
    </>
  );
}
