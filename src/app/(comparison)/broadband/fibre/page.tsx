import type { Metadata } from "next";
import Link from "next/link";
import {
  Wifi,
  Zap,
  ShieldCheck,
  Gauge,
  ArrowRight,
  BadgePercent,
  ExternalLink,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProviderLogo } from "@/components/shared/provider-logo";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/seo";
import { getBrandColor } from "@/config/brand-colors";
import { getDisplayOffers } from "@/lib/offers-live";
import {
  BreadcrumbJsonLd,
  ItemListJsonLd,
  FAQPageJsonLd,
} from "@/components/shared/json-ld";

/**
 * /broadband/fibre — full-fibre landing page. Was linked from the nav
 * and sitemap but never built, so it fell through to the [city] route's
 * notFound(). Combines live fibre deals from the DB with the broadband
 * promos from the offers pipeline.
 */

export const metadata: Metadata = {
  title: "Full Fibre Broadband Deals UK 2026 — Compare Speeds & Prices",
  description:
    "Compare full-fibre broadband from Be Fibre, Quickline, Highland Broadband, Connect Fibre and more. Symmetric speeds from £20/mo, switching rewards up to £300.",
  alternates: { canonical: `${siteConfig.url}/broadband/fibre` },
  openGraph: {
    type: "website",
    title: "Full Fibre Broadband Deals UK — Compare Speeds & Prices",
    description:
      "Live full-fibre deals and promotions from our UK partners — symmetric speeds from £20/mo.",
    url: `${siteConfig.url}/broadband/fibre`,
  },
};

export const dynamic = "force-dynamic";

const FAQS = [
  {
    question: "What is full fibre (FTTP) broadband?",
    answer:
      "Full fibre — fibre to the premises (FTTP) — runs a fibre-optic cable all the way into your home, instead of stopping at the street cabinet like FTTC. That means gigabit-capable download speeds, much faster uploads (often symmetric), and a more reliable connection.",
  },
  {
    question: "How do I know if full fibre is available at my address?",
    answer:
      "Every provider runs a postcode check before you order. Altnets like Be Fibre, Quickline, Highland Broadband, Connect Fibre and Lightning Fibre each cover specific regions, so check two or three — coverage differs street by street.",
  },
  {
    question: "Can a new provider pay my exit fees?",
    answer:
      "Some do. Quickline currently covers up to £300 of early-termination fees when you switch to its full-fibre service — see the live promotions above for what's on right now.",
  },
];

function speedLabel(mbps?: number | null): string {
  if (!mbps) return "Fibre";
  if (mbps >= 900) return "Gigabit";
  if (mbps >= 500) return "Ultrafast";
  if (mbps >= 100) return "Superfast";
  return "Fibre";
}

export default async function FibreBroadbandPage() {
  const [deals, display] = await Promise.all([
    prisma.plan
      .findMany({
        where: {
          category: "broadband",
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        include: { provider: { select: { name: true, slug: true, logo: true } } },
        orderBy: { monthlyCost: "asc" },
        take: 24,
      })
      .catch(() => []),
    getDisplayOffers().catch(() => ({ offers: [], note: "error" })),
  ]);

  const promos = display.offers.filter((o) => o.category === "broadband");
  const cheapest = deals.length ? Math.min(...deals.map((d) => d.monthlyCost)) : null;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Broadband", url: `${siteConfig.url}/broadband` },
          { name: "Full Fibre", url: `${siteConfig.url}/broadband/fibre` },
        ]}
      />
      <ItemListJsonLd
        name="Full Fibre Broadband Deals"
        url={`${siteConfig.url}/broadband/fibre`}
        items={deals.slice(0, 12).map((d) => ({
          name: `${d.provider.name} — ${d.name}`,
          url: `${siteConfig.url}/deals/${d.slug}`,
          price: d.monthlyCost,
        }))}
      />
      <FAQPageJsonLd faqs={FAQS} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0c4a6e] via-[#0e7490] to-[#38a169] text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <Badge className="mb-4 bg-white/15 text-white border-0 backdrop-blur-sm">
            <Wifi className="size-3.5 mr-1" />
            Full fibre (FTTP)
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl">
            Full fibre broadband deals
          </h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-white/80 leading-relaxed">
            Fibre all the way to your door — gigabit-capable speeds and
            symmetric uploads from the UK&apos;s alternative networks
            {cheapest ? (
              <>
                , with live deals from{" "}
                <span className="font-bold text-white">
                  £{cheapest.toFixed(2)}/month
                </span>
              </>
            ) : null}
            .
          </p>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/70">
            <span className="flex items-center gap-2">
              <Zap className="size-4 text-emerald-300" />
              Up to 2,300Mbps symmetric
            </span>
            <span className="flex items-center gap-2">
              <BadgePercent className="size-4 text-emerald-300" />
              {promos.length} live fibre promotions
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-300" />
              Awin-verified partner links
            </span>
          </div>
        </div>
      </section>

      {/* Live fibre promotions */}
      {promos.length > 0 && (
        <section className="bg-slate-50 dark:bg-slate-950 border-b border-border/40">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0e7490] to-[#38a169] text-white shadow-md">
                <BadgePercent className="size-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">
                  Live fibre promotions
                </h2>
                <p className="text-sm text-muted-foreground">
                  Auto-updated daily from our partner network —{" "}
                  <Link href="/offers" className="underline underline-offset-2">
                    see all offers
                  </Link>
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {promos.map((o) => {
                const brand = getBrandColor(o.merchant);
                const grad = brand
                  ? `linear-gradient(135deg, ${brand.from}, ${brand.to})`
                  : "linear-gradient(135deg, #0e7490, #38a169)";
                return (
                  <div
                    key={o.id}
                    className="group relative rounded-2xl bg-white dark:bg-slate-900/80 border border-border/60 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1"
                      style={{ background: grad }}
                    />
                    <div className="p-4 pl-5 flex flex-col gap-2 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {o.merchantName}
                        </p>
                        <span
                          className="rounded-md px-2 py-0.5 text-[10px] font-extrabold text-white whitespace-nowrap"
                          style={{ background: grad }}
                        >
                          {o.badge}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold leading-snug flex-1">
                        {o.title}
                      </h3>
                      {o.endsAt && (
                        <p className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="size-3" />
                          Ends {o.endsAt}
                        </p>
                      )}
                      <a
                        href={o.href}
                        target="_blank"
                        rel="noopener noreferrer nofollow sponsored"
                        className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#1a365d] to-[#38a169] hover:from-[#2a4a7f] hover:to-[#48bb78] text-white px-4 py-1.5 text-xs font-bold shadow-md transition-colors"
                      >
                        Get deal
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Live deals */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            Full fibre deals, cheapest first
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            Live prices from our partner feeds. Availability is
            postcode-dependent — every provider checks your address before
            you order.
          </p>
          {deals.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed py-16 text-center">
              <p className="text-lg font-semibold">
                Feed refresh in progress
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Check back shortly, or browse{" "}
                <Link href="/offers" className="underline">
                  live fibre promotions
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {deals.map((d) => {
                const brand = getBrandColor(d.provider.slug);
                const grad = brand
                  ? `linear-gradient(135deg, ${brand.from}, ${brand.to})`
                  : "linear-gradient(135deg, #1a365d, #38a169)";
                return (
                  <div
                    key={d.id}
                    className="group rounded-2xl bg-white dark:bg-slate-900/80 border border-border/60 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 p-4 sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                      <div className="flex items-center gap-3 sm:w-[300px] sm:shrink-0 min-w-0">
                        <ProviderLogo
                          name={d.provider.name}
                          slug={d.provider.slug}
                          logo={d.provider.logo}
                          size={44}
                        />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {d.provider.name}
                          </p>
                          <h3 className="text-sm font-bold leading-tight line-clamp-2 mt-0.5">
                            {d.name}
                          </h3>
                        </div>
                      </div>
                      <div className="text-center sm:flex-1">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold">
                          <Gauge className="size-3.5" />
                          {d.downloadSpeed
                            ? `${d.downloadSpeed}Mbps · ${speedLabel(d.downloadSpeed)}`
                            : speedLabel(null)}
                        </span>
                      </div>
                      <div className="text-center sm:text-right sm:shrink-0">
                        <div
                          className="rounded-xl px-4 py-2 text-white shadow-md inline-block"
                          style={{ background: grad }}
                        >
                          <span className="text-2xl font-extrabold tabular-nums">
                            £{d.monthlyCost.toFixed(2)}
                          </span>
                          <span className="text-xs opacity-90 ml-0.5">/mo</span>
                        </div>
                      </div>
                      <Button
                        asChild
                        className="bg-gradient-to-r from-[#1a365d] to-[#38a169] hover:from-[#2a4a7f] hover:to-[#48bb78] text-white border-0 font-semibold px-6 sm:shrink-0 shadow-md"
                      >
                        <Link href={`/deals/${d.slug}`}>
                          View deal
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 dark:bg-slate-950 border-t">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
          <Badge className="mb-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-md">
            FAQ
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            Full fibre, explained
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl bg-white dark:bg-slate-900/60 border border-border/50 p-5 shadow-sm hover:shadow-md transition-all"
              >
                <summary className="cursor-pointer text-base font-bold flex items-start justify-between gap-3">
                  <span>{faq.question}</span>
                  <span className="shrink-0 size-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center text-xs font-extrabold group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
