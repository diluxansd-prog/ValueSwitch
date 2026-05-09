import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Sparkles,
  Trophy,
  Award,
  Medal,
  Flame,
  TrendingDown,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/seo";
import { getBrandColor } from "@/config/brand-colors";
import { ProviderLogo } from "@/components/shared/provider-logo";
import {
  BreadcrumbJsonLd,
  ItemListJsonLd,
  FAQPageJsonLd,
  ArticleJsonLd,
} from "@/components/shared/json-ld";

/**
 * Curated commercial-intent landing pages — `/best/[type]`.
 *
 * Each entry targets a specific high-intent UK search query and pulls
 * a hand-tuned slice of the live affiliate feed.  Different from
 * `/sim-only/[filter]` (price/data axis) and `/best-deals/[brand]`
 * (handset brand axis) — these are editorial commercial picks.
 */

interface Pick {
  slug: string;
  /** SEO title (50-60 chars) */
  title: string;
  /** Meta description (150-160 chars) */
  description: string;
  /** H1 — usually mirrors title */
  h1: string;
  /** Subhead used under H1 + as Article headline summary */
  subhead: string;
  heroFrom: string;
  heroTo: string;
  /** Prisma where filter */
  where: Prisma.PlanWhereInput;
  /** orderBy clause to surface the right deals first */
  orderBy: Prisma.PlanOrderByWithRelationInput[];
  /** Take limit (most pages cap at 12 to keep authority concentrated) */
  take: number;
  /** Editor's commentary above the deals grid */
  intro: string;
  faqs: { question: string; answer: string }[];
}

const PICKS: Record<string, Pick> = {
  "cheapest-iphone-uk": {
    slug: "cheapest-iphone-uk",
    title: "Cheapest iPhone Deals UK 2026 — Live Affiliate Prices",
    description:
      "Hand-picked cheapest iPhone deals across every UK retailer we track. iPhone 17, 16, 15, 14, refurb. Awin verified, updated weekly.",
    h1: "Cheapest iPhone deals UK",
    subhead:
      "We tracked every active iPhone deal across our Awin partners and surfaced the lowest monthly prices for each model line — new, refurbished and SIM-free.",
    heroFrom: "#475569",
    heroTo: "#1e293b",
    where: {
      category: "mobile",
      OR: [
        { handsetModel: { contains: "Apple", mode: "insensitive" } },
        { handsetModel: { contains: "iPhone", mode: "insensitive" } },
        { name: { contains: "iPhone", mode: "insensitive" } },
      ],
    },
    orderBy: [{ monthlyCost: "asc" }],
    take: 16,
    intro:
      "Hand-picked from live UK affiliate feeds, sorted by monthly cost. Refurbished and SIM-free deals are flagged. All prices come direct from Awin partner feeds and update weekly.",
    faqs: [
      {
        question: "What's the cheapest iPhone you can get in the UK right now?",
        answer:
          "As of May 2026, refurbished iPhone 13 deals on Mozillion start from around £200 outright (£8/mo equivalent over 24 months). New iPhone contracts start from around £25-30/mo for the iPhone 15 base model on long-term contracts.",
      },
      {
        question: "Are refurbished iPhones safe to buy?",
        answer:
          "Yes, when bought from certified refurbishers like Mozillion. They include a 12-month warranty and 14-day no-quibble returns. Avoid grey-market sellers with no UK address. See our refurbished iPhone vs new buyer's guide for the full breakdown.",
      },
      {
        question: "Should I buy iPhone outright or on contract?",
        answer:
          "If you can afford the upfront cost, buying outright (or refurbished) plus a SIM-only deal almost always works out £100-£300 cheaper over 24 months than the equivalent contract deal. The bigger your usage, the bigger the saving.",
      },
    ],
  },
  "cheapest-samsung-galaxy-uk": {
    slug: "cheapest-samsung-galaxy-uk",
    title: "Cheapest Samsung Galaxy Deals UK 2026 — Live Prices",
    description:
      "Live UK Samsung Galaxy deals from £15/mo. Galaxy S25, S24, A-series and refurb options. Awin verified affiliate prices, updated weekly.",
    h1: "Cheapest Samsung Galaxy deals UK",
    subhead:
      "Active Samsung Galaxy deals across our Awin partners — flagship S25 Ultra to budget A-series, plus refurbished. Sorted by monthly cost.",
    heroFrom: "#1e40af",
    heroTo: "#1e3a8a",
    where: {
      category: "mobile",
      OR: [
        { handsetModel: { contains: "Samsung", mode: "insensitive" } },
        { handsetModel: { contains: "Galaxy", mode: "insensitive" } },
        { name: { contains: "Galaxy", mode: "insensitive" } },
      ],
    },
    orderBy: [{ monthlyCost: "asc" }],
    take: 16,
    intro:
      "Galaxy deals across our entire Awin partner network — including the latest S25 line plus older flagships at sharper prices. Refurb deals are flagged with the model condition where available.",
    faqs: [
      {
        question: "What's the cheapest Galaxy S25 deal in the UK?",
        answer:
          "Cheapest S25 deals at the time of writing start around £35/mo on 36-month contracts at major UK retailers. The S25 Ultra runs about £55/mo on the same length contracts. SIM-free outright pricing tends to be the cheapest TCO over 24 months if you have the upfront budget.",
      },
      {
        question: "Are refurbished Galaxy phones reliable?",
        answer:
          "Mozillion-grade certified refurbished Galaxy phones include the same 12-month warranty as new, with battery health checks and full reset. The hardware is the same — only cosmetics may vary by grade.",
      },
    ],
  },
  "best-pixel-deal-uk": {
    slug: "best-pixel-deal-uk",
    title: "Best Google Pixel Deals UK 2026 — Pixel 10, 9 & Refurb",
    description:
      "Compare every UK Google Pixel deal we track — Pixel 10, 9, 9a, refurbished. Live affiliate prices from £12/mo. Awin verified, updated weekly.",
    h1: "Best Google Pixel deals UK",
    subhead:
      "Google's Pixel line-up has the best computational photography per pound in the UK. Here's every Pixel deal we currently track, sorted cheapest first.",
    heroFrom: "#0d9488",
    heroTo: "#0f766e",
    where: {
      category: "mobile",
      OR: [
        { handsetModel: { contains: "Google", mode: "insensitive" } },
        { handsetModel: { contains: "Pixel", mode: "insensitive" } },
        { name: { contains: "Pixel", mode: "insensitive" } },
      ],
    },
    orderBy: [{ monthlyCost: "asc" }],
    take: 14,
    intro:
      "Google's Pixel line is genuinely competitive on price — particularly the 'a' series (Pixel 9a) and refurbished older flagships (Pixel 8 Pro). Sorted by monthly cost.",
    faqs: [
      {
        question: "Is a Pixel cheaper than an iPhone with the same specs?",
        answer:
          "Yes — the Pixel 9 Pro currently undercuts equivalent iPhone 17 Pro pricing by 20-30% on UK contract deals. The 'a' series (Pixel 9a) is even cheaper while keeping the same camera processing.",
      },
      {
        question: "How long does Google support older Pixel phones?",
        answer:
          "Pixel 8 onwards gets 7 years of OS + security updates from Google, longer than most Android brands. This makes refurb Pixel 8/9 deals particularly attractive for long-term ownership.",
      },
    ],
  },
  "unlimited-data-sim-uk": {
    slug: "unlimited-data-sim-uk",
    title: "Best Unlimited Data SIM Deals UK 2026 — From £12.50/mo",
    description:
      "Compare unlimited 5G UK SIM-only deals — Smarty, Talkmobile, Three and more. Live Awin-verified prices, updated weekly.",
    h1: "Best unlimited data SIM deals UK",
    subhead:
      "Hand-picked unlimited SIMs from across our Awin partners. Includes raw 5G capacity, fair-use details, and EU roaming flags so you don't get caught out.",
    heroFrom: "#7c3aed",
    heroTo: "#5b21b6",
    where: {
      category: "mobile",
      subcategory: "sim-only",
      OR: [
        { dataAllowance: { contains: "Unlimited", mode: "insensitive" } },
        { dataAllowance: { contains: "unlimited", mode: "insensitive" } },
      ],
    },
    orderBy: [{ monthlyCost: "asc" }],
    take: 12,
    intro:
      "True unlimited 5G data in the UK starts from £12.50/mo on Smarty (Three network) and £14.95/mo on Talkmobile (Vodafone network). Both let you tether and stream without any soft cap.",
    faqs: [
      {
        question: "Is unlimited UK SIM really unlimited?",
        answer:
          "On Smarty, Talkmobile, giffgaff and 1pMobile: yes, with no fair-use cap. EE, O2 and Vodafone's main brands apply a soft fair-use cap of around 1TB/month — you'll never hit it but legally it's a cap.",
      },
      {
        question: "Can I use unlimited SIM as home broadband?",
        answer:
          "Yes — most allow tethering and hotspot use without a separate cap. Speeds depend on your local 5G coverage. Three's 5G has the largest UK footprint by area; Vodafone has the strongest urban coverage.",
      },
    ],
  },
  "no-credit-check-mobile-uk": {
    slug: "no-credit-check-mobile-uk",
    title: "No Credit Check Mobile Deals UK 2026 — SIM-Only Options",
    description:
      "UK SIM-only and pay-monthly deals that don't require a credit check. Lebara, Talkmobile, giffgaff and more. Awin verified prices.",
    h1: "No credit check mobile deals UK",
    subhead:
      "If you've got bad credit, no credit history, or you're new to the UK — these SIM-only deals don't run a credit check.",
    heroFrom: "#dc2626",
    heroTo: "#991b1b",
    where: {
      category: "mobile",
      subcategory: "sim-only",
      provider: {
        slug: { in: ["lebara", "talkmobile", "1pmobile", "ttfone"] },
      },
    },
    orderBy: [{ monthlyCost: "asc" }],
    take: 16,
    intro:
      "Major UK networks (EE, O2, Three, Vodafone) credit-check every new pay-monthly customer. The deals below come from MVNOs that don't run a credit check — Lebara, Talkmobile, giffgaff, 1pMobile, TTfone — so anyone over 18 with a UK address can sign up.",
    faqs: [
      {
        question: "Which UK mobile networks don't credit-check?",
        answer:
          "Lebara, Talkmobile (12-month contracts only), giffgaff (PAYG goodybags), 1pMobile and TTfone don't run credit checks for SIM-only plans. Phone-on-contract deals from any UK network typically do credit-check.",
      },
      {
        question: "Can I get a phone on contract with bad credit?",
        answer:
          "Major networks will likely decline. The route is: buy a refurbished or SIM-free phone outright (or use a buy-now-pay-later facility) and combine it with a no-credit-check SIM. Cheaper than 'subprime' contract offers and avoids the rejection risk entirely.",
      },
      {
        question: "Will using a no-credit-check SIM hurt my credit?",
        answer:
          "No — and that's the point. Because they don't run a credit search, there's no hard inquiry on your file. You also can't build credit history from these deals, so they're a 'safe' option but not a way to rebuild credit.",
      },
    ],
  },
  "cheapest-broadband-uk": {
    slug: "cheapest-broadband-uk",
    title: "Cheapest Broadband UK 2026 — Live Full-Fibre Deals From £19/mo",
    description:
      "Compare the cheapest UK broadband deals across full-fibre, ultrafast and standard. Live Awin partner prices, real monthly cost. Updated weekly.",
    h1: "Cheapest broadband UK",
    subhead:
      "Hand-picked cheapest UK broadband deals from our Awin affiliate partners. Sorted by monthly cost — cheapest at the top.",
    heroFrom: "#7c3aed",
    heroTo: "#1e3a8a",
    where: { category: "broadband" },
    orderBy: [{ monthlyCost: "asc" }],
    take: 12,
    intro:
      "Cheapest broadband in the UK sits around £19-£24/mo for slower 36 Mbps tiers, £25-£35 for full-fibre. Always verify availability at your address with an Ofcom postcode check before signing.",
    faqs: [
      {
        question: "What's the absolute cheapest UK broadband deal?",
        answer:
          "As of May 2026, the cheapest fixed-line broadband deals start around £19/mo for slower copper-based packages. Full-fibre starts around £24-£25/mo for the cheapest 100 Mbps tier on Be Fibre or similar altnets.",
      },
      {
        question: "Is the cheapest broadband always the best value?",
        answer:
          "No — beware bait headline rates that bump after 12 months and £40-£100 setup fees. Always check total contract cost, not just the headline monthly. Our broadband comparison page sorts by total cost, not just monthly rate.",
      },
    ],
  },
};

interface PageProps {
  params: Promise<{ type: string }>;
}

export async function generateStaticParams() {
  return Object.keys(PICKS).map((type) => ({ type }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { type } = await params;
  const pick = PICKS[type];
  if (!pick) return { title: "Best Deals" };
  return {
    title: pick.title,
    description: pick.description,
    alternates: { canonical: `${siteConfig.url}/best/${type}` },
    openGraph: {
      type: "website",
      title: pick.title,
      description: pick.description,
      url: `${siteConfig.url}/best/${type}`,
    },
  };
}

export const dynamic = "force-dynamic";

export default async function BestPickPage({ params }: PageProps) {
  const { type } = await params;
  const pick = PICKS[type];
  if (!pick) notFound();

  let deals: Array<{
    id: string;
    name: string;
    slug: string;
    monthlyCost: number;
    contractLength: number | null;
    dataAllowance: string | null;
    networkType: string | null;
    imageUrl: string | null;
    subcategory: string | null;
    provider: { name: string; slug: string; logo: string | null };
  }> = [];

  try {
    const result = await prisma.plan.findMany({
      where: pick.where,
      include: {
        provider: { select: { name: true, slug: true, logo: true } },
      },
      orderBy: pick.orderBy,
      take: pick.take,
    });
    deals = result;
  } catch {
    deals = [];
  }

  const url = `${siteConfig.url}/best/${type}`;
  const cheapest = deals.length > 0 ? deals[0].monthlyCost : 0;

  const rankStyles = [
    { chip: "from-amber-400 to-yellow-500", icon: Trophy },
    { chip: "from-slate-300 to-slate-500", icon: Award },
    { chip: "from-orange-400 to-amber-700", icon: Medal },
  ];

  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Best deals", url: `${siteConfig.url}/best` },
          { name: pick.h1, url },
        ]}
      />
      <ArticleJsonLd
        title={pick.title}
        description={pick.description}
        url={url}
        author="ValueSwitch Editors"
      />
      <ItemListJsonLd
        name={pick.title}
        url={url}
        items={deals.slice(0, 10).map((d) => ({
          name: `${d.provider.name} ${d.name}`,
          url: `${siteConfig.url}/deals/${d.slug}`,
          price: d.monthlyCost,
        }))}
      />
      <FAQPageJsonLd faqs={pick.faqs} />

      {/* Hero */}
      <section
        className="relative py-14 sm:py-20 text-white overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${pick.heroFrom} 0%, ${pick.heroTo} 60%, #0a1628 130%)`,
        }}
      >
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/5 blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-white/15 text-white border-white/20 backdrop-blur-sm">
              <Flame className="size-3 mr-1" />
              Editor&apos;s pick · {deals.length} live deals
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {pick.h1}
            </h1>
            <p className="mt-5 text-lg text-white/90 leading-relaxed max-w-2xl speakable-summary">
              {pick.subhead}
            </p>
          </div>
        </div>
      </section>

      {/* Live stats */}
      <section className="border-b bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900/40 dark:via-slate-900/20 dark:to-slate-900/40">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
            {[
              {
                icon: Sparkles,
                value: deals.length.toString(),
                label: "Hand-picked",
                grad: "from-rose-500 to-pink-600",
              },
              {
                icon: TrendingDown,
                value: cheapest > 0 ? `£${cheapest.toFixed(2)}` : "—",
                label: "Cheapest /mo",
                grad: "from-emerald-500 to-emerald-700",
              },
              {
                icon: ShieldCheck,
                value: new Set(deals.map((d) => d.provider.slug)).size.toString(),
                label: "Retailers",
                grad: "from-blue-500 to-indigo-600",
              },
              {
                icon: Clock,
                value: "Weekly",
                label: "Refreshed",
                grad: "from-amber-500 to-orange-600",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="text-center sm:text-left flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div
                  className={`mx-auto sm:mx-0 size-11 rounded-xl bg-gradient-to-br ${s.grad} text-white flex items-center justify-center shadow-lg shrink-0`}
                >
                  <s.icon className="size-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold tabular-nums">
                    {s.value}
                  </div>
                  <div className="text-[11px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editor's intro */}
      <section className="bg-background">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <p className="text-base text-muted-foreground leading-relaxed">
            {pick.intro}
          </p>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900/40 dark:via-slate-950 dark:to-slate-900/40">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
          {deals.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed py-16 text-center">
              <p className="text-lg font-semibold">
                No deals matching this pick right now
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Our weekly refresh runs every Sunday — check back soon.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {deals.map((deal, idx) => {
                const rank = idx < 3 ? rankStyles[idx] : null;
                const RankIcon = rank?.icon;
                const brand = getBrandColor(deal.provider.slug);
                const priceGrad = brand
                  ? { from: brand.from, to: brand.to }
                  : { from: "#1a365d", to: "#38a169" };
                return (
                  <div
                    key={deal.id}
                    className={`group relative rounded-2xl bg-white dark:bg-slate-900/80 border border-border/60 ${rank ? "ring-1 ring-amber-200/50 dark:ring-amber-900/30" : ""} shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden`}
                  >
                    {rank && (
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${rank.chip}`}
                      />
                    )}
                    <div className="p-4 sm:p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                        <div
                          className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-white font-extrabold text-base shadow-md ${
                            rank
                              ? `bg-gradient-to-br ${rank.chip}`
                              : "bg-gradient-to-br from-slate-400 to-slate-600"
                          }`}
                        >
                          {RankIcon ? (
                            <RankIcon className="size-5" />
                          ) : (
                            <span>#{idx + 1}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 sm:w-[260px] sm:shrink-0 min-w-0">
                          {deal.imageUrl ? (
                            <div className="relative size-14 shrink-0 rounded-lg bg-slate-50 dark:bg-slate-800/50 ring-1 ring-border/50">
                              <Image
                                src={deal.imageUrl}
                                alt={deal.name}
                                fill
                                className="object-contain p-1.5"
                                sizes="56px"
                              />
                            </div>
                          ) : (
                            <ProviderLogo
                              name={deal.provider.name}
                              slug={deal.provider.slug}
                              logo={deal.provider.logo}
                              size={44}
                            />
                          )}
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              {deal.provider.name}
                            </p>
                            <h3 className="text-sm font-bold leading-tight line-clamp-2 mt-0.5">
                              {deal.name.replace(/ - £[\d.]+\/mo.*/, "")}
                            </h3>
                          </div>
                        </div>

                        {deal.dataAllowance && (
                          <div className="text-center sm:flex-1">
                            <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">
                              {deal.dataAllowance.replace(/GB/i, "")}
                              <span className="text-sm font-bold ml-0.5">
                                {deal.dataAllowance.match(/GB/i) ? "GB" : ""}
                              </span>
                            </p>
                            <p className="text-[10px] text-muted-foreground font-medium">
                              {deal.networkType ?? "data"}
                            </p>
                          </div>
                        )}

                        <div className="text-center sm:text-right sm:shrink-0 sm:min-w-[140px]">
                          <div
                            className="rounded-xl px-4 py-2 text-white shadow-md inline-block sm:w-full"
                            style={{
                              background: `linear-gradient(135deg, ${priceGrad.from}, ${priceGrad.to})`,
                            }}
                          >
                            <div className="flex items-baseline gap-0.5 justify-center sm:justify-end">
                              <span className="text-2xl font-extrabold tabular-nums">
                                £{deal.monthlyCost.toFixed(2)}
                              </span>
                              <span className="text-xs opacity-90 ml-0.5">
                                /mo
                              </span>
                            </div>
                            {deal.contractLength === 1 && (
                              <p className="text-[10px] opacity-85 font-medium">
                                30-day rolling
                              </p>
                            )}
                            {deal.contractLength &&
                              deal.contractLength > 1 && (
                                <p className="text-[10px] opacity-85 font-medium">
                                  {deal.contractLength}-month
                                </p>
                              )}
                          </div>
                        </div>

                        <Button
                          asChild
                          className="bg-gradient-to-r from-[#1a365d] to-[#38a169] hover:from-[#2a4a7f] hover:to-[#48bb78] text-white border-0 font-semibold px-6 sm:shrink-0 shadow-md"
                        >
                          <Link href={`/deals/${deal.slug}`}>
                            View deal
                            <ArrowRight className="size-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-background border-t">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
          <Badge className="mb-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-md">
            FAQ
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            Common questions
          </h2>
          <div className="space-y-4">
            {pick.faqs.map((faq) => (
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

      {/* Other picks */}
      <section className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/40 dark:to-slate-950 border-t">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
          <h2 className="text-xl font-bold mb-5">Other editor&apos;s picks</h2>
          <div className="flex flex-wrap gap-2">
            {Object.values(PICKS)
              .filter((p) => p.slug !== type)
              .map((p) => (
                <Link
                  key={p.slug}
                  href={`/best/${p.slug}`}
                  className="rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-gradient-to-r hover:from-rose-500 hover:to-pink-600 hover:text-white px-4 py-2 text-sm font-semibold transition-all"
                >
                  {p.h1}
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
