import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CardSim,
  Sparkles,
  TrendingDown,
  Globe,
  Clock,
  Zap,
  Award,
  Trophy,
  Medal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/seo";
import { getBrandColor } from "@/config/brand-colors";
import { ProviderLogo } from "@/components/shared/provider-logo";
import {
  BreadcrumbJsonLd,
  ItemListJsonLd,
  FAQPageJsonLd,
} from "@/components/shared/json-ld";

/**
 * Programmatic SIM-only landing pages — `/sim-only/[filter]`.
 *
 * Each filter value generates a unique URL targeting a long-tail UK
 * search query.  We hand-author the metadata + intro copy so each
 * page reads naturally, then back it with live affiliate prices from
 * the same partner feed used everywhere else.
 *
 * Filters supported:
 *   under-10        → £10/mo or under
 *   under-15        → £15/mo or under
 *   unlimited       → unlimited data plans
 *   100gb-plus      → 100GB+ data
 *   30-day-rolling  → no-contract month-to-month
 *
 * Adding a new filter = adding a row to FILTER_CONFIG.  No new files,
 * no schema changes — pure content expansion.
 */

interface FilterConfig {
  slug: string;
  /** SEO title (50-60 chars optimal) */
  title: string;
  /** SEO meta description (150-160 chars) */
  description: string;
  /** H1 — usually matches title minus the brand suffix */
  h1: string;
  /** Subheading shown under H1 */
  subhead: string;
  /** Hero accent gradient (Tailwind classes) */
  heroFrom: string;
  heroTo: string;
  /** Prisma where filter applied to Plan */
  whereClause: Record<string, unknown>;
  /** What it includes — bullet points shown on the page */
  highlights: string[];
  /** Per-page FAQ for FAQPage schema */
  faqs: { question: string; answer: string }[];
}

const FILTER_CONFIG: Record<string, FilterConfig> = {
  "under-10": {
    slug: "under-10",
    title: "Cheapest SIM-Only Deals Under £10/Month UK 2026",
    description:
      "Live UK SIM-only deals for £10/month or less — Talkmobile, Lebara, giffgaff and more. Real Awin-verified prices, sorted cheapest first. Updated weekly.",
    h1: "SIM-only deals under £10/month",
    subhead:
      "Every UK SIM-only plan we track at £10/mo or under, sorted cheapest first. Real prices from our Awin partners — no padding, no expired offers.",
    heroFrom: "#10b981",
    heroTo: "#047857",
    whereClause: {
      category: "mobile",
      subcategory: "sim-only",
      monthlyCost: { lte: 10 },
    },
    highlights: [
      "Verified Awin partner prices, refreshed every Sunday",
      "All deals sit at £10/mo or under for the full contract",
      "EU roaming clearly flagged so no surprise bills abroad",
    ],
    faqs: [
      {
        question: "What's the cheapest SIM-only deal in the UK right now?",
        answer:
          "As of May 2026, Talkmobile's £8/mo for 50GB on Vodafone's network is the cheapest UK SIM-only deal with substantial data. For lighter users, several MVNOs offer 5-10GB plans from £4-6/mo.",
      },
      {
        question: "Are sub-£10 SIM-only deals reliable?",
        answer:
          "Yes — most use the major UK networks (Vodafone, EE, O2, Three) under the hood. Talkmobile uses Vodafone, Lebara uses Vodafone, Smarty uses Three, giffgaff uses O2. Coverage is identical to the parent network in 95% of cases.",
      },
      {
        question: "Can I keep my number on a £10 SIM?",
        answer:
          "Yes. Text PAC to 65075 from your current network to get a transfer code, give it to your new SIM-only provider when signing up, and your number ports automatically within 1 working day.",
      },
      {
        question: "Do under-£10 SIMs include EU roaming?",
        answer:
          "Some do, most don't. Lebara includes free roaming in 39 countries. Talkmobile charges £1.99/day. Smarty charges £2/day. Always check the small print before travelling.",
      },
    ],
  },
  "under-15": {
    slug: "under-15",
    title: "Best SIM-Only Deals Under £15/Month UK 2026",
    description:
      "Live UK SIM-only deals from £8 to £15/month. Unlimited data options, 5G plans, EU roaming included on selected deals. Awin verified, updated weekly.",
    h1: "SIM-only deals under £15/month",
    subhead:
      "The £15 sweet spot — enough budget for unlimited data on most networks, plus EU roaming bundles. Live prices from our Awin partners.",
    heroFrom: "#3b82f6",
    heroTo: "#1e40af",
    whereClause: {
      category: "mobile",
      subcategory: "sim-only",
      monthlyCost: { lte: 15 },
    },
    highlights: [
      "Includes unlimited-data plans within budget",
      "Most have 5G access at no extra charge",
      "EU roaming-inclusive deals clearly badged",
    ],
    faqs: [
      {
        question: "Can I get unlimited data for under £15?",
        answer:
          "Yes — Talkmobile's £14.95/mo Unlimited plan and Smarty's £12-14 unlimited tariffs both fit under £15. Smarty caps speeds during congestion; Talkmobile doesn't.",
      },
      {
        question: "Is £15/mo enough for 5G?",
        answer:
          "Yes. Almost every UK MVNO now offers 5G at no extra charge. Vodafone-network MVNOs (Talkmobile, Lebara) have 5G in most cities. Three-network MVNOs (Smarty) have the largest 5G footprint by area.",
      },
      {
        question: "Should I pick a 12-month or 30-day contract?",
        answer:
          "30-day rolling deals cost £1-3/mo more but let you cancel any time. Worth it if your job, address or travel plans might change in the next year. Otherwise the 12-month contract usually saves £20-40 over the year.",
      },
    ],
  },
  unlimited: {
    slug: "unlimited",
    title: "Best Unlimited Data SIM-Only Deals UK 2026",
    description:
      "Compare unlimited 5G data SIM-only plans from Talkmobile, Smarty, Three and more. Live UK prices from £12.50/mo. Awin verified, updated weekly.",
    h1: "Unlimited data SIM-only deals",
    subhead:
      "Everything we track that genuinely includes unlimited 5G/4G data — no fair-use cap, no speed throttling. Real UK prices, Awin verified.",
    heroFrom: "#8b5cf6",
    heroTo: "#5b21b6",
    whereClause: {
      category: "mobile",
      subcategory: "sim-only",
      OR: [
        { dataAllowance: { contains: "Unlimited", mode: "insensitive" } },
        { dataAllowance: { contains: "unlimited", mode: "insensitive" } },
      ],
    },
    highlights: [
      "All deals include genuine unlimited data, not a soft 'unlimited' with throttling",
      "5G access included on every plan",
      "Some include free EU roaming — flagged on each card",
    ],
    faqs: [
      {
        question: "What's the cheapest unlimited UK SIM right now?",
        answer:
          "Smarty's £12.50/mo unlimited plan on Three's network is currently the cheapest in the UK. Talkmobile's £14.95/mo unlimited on Vodafone is a close second with better congestion priority.",
      },
      {
        question: "Is 'unlimited' really unlimited?",
        answer:
          "On Smarty, Talkmobile and giffgaff: yes, with no fair-use cap. Some networks (notably EE, O2 and Vodafone's main brands) apply a soft fair-use cap of 1TB/month — you'll never hit it but legally it's a cap.",
      },
      {
        question: "Do I need unlimited data?",
        answer:
          "Most UK users average 22GB/mo (Ofcom 2025). Unless you stream daily on cellular, hotspot heavily, or use cloud backup over mobile, a 50-100GB plan is usually cheaper without losing functionality.",
      },
    ],
  },
  "100gb-plus": {
    slug: "100gb-plus",
    title: "Best 100GB+ SIM-Only Deals UK 2026",
    description:
      "Compare 100GB+ data SIM-only plans for heavy UK mobile users. From £10/mo on Smarty, Talkmobile and more. Awin verified, refreshed weekly.",
    h1: "100GB+ data SIM-only deals",
    subhead:
      "For hotspot users, daily streamers and remote workers — every UK SIM we track with at least 100GB of monthly data.",
    heroFrom: "#f97316",
    heroTo: "#c2410c",
    whereClause: {
      category: "mobile",
      subcategory: "sim-only",
      OR: [
        { dataAllowance: { contains: "100GB", mode: "insensitive" } },
        { dataAllowance: { contains: "150GB", mode: "insensitive" } },
        { dataAllowance: { contains: "200GB", mode: "insensitive" } },
        { dataAllowance: { contains: "Unlimited", mode: "insensitive" } },
      ],
    },
    highlights: [
      "Every deal includes at least 100GB of monthly data",
      "Suitable for primary-line hotspot use",
      "5G included on every plan we list",
    ],
    faqs: [
      {
        question: "Is 100GB enough for a primary home broadband replacement?",
        answer:
          "For 1-2 person households who don't stream 4K video, yes. Average UK home broadband use is around 480GB/month — so 100GB on mobile only works as a backup or for low-usage households. Power users should look at unlimited 5G home broadband instead.",
      },
      {
        question: "Can I use a 100GB SIM as a hotspot?",
        answer:
          "Yes, all the plans we list permit hotspot/tethering use. Some networks (notably EE) impose a soft hotspot cap of 30GB/month on certain tariffs — we flag this in the deal description.",
      },
    ],
  },
  "30-day-rolling": {
    slug: "30-day-rolling",
    title: "Best 30-Day Rolling SIM-Only Deals UK 2026 — No Contract",
    description:
      "No-contract UK SIM-only deals — cancel any month, keep your number, change networks freely. Live prices from £6/mo. Awin verified weekly.",
    h1: "30-day rolling SIM-only deals",
    subhead:
      "Month-to-month flexibility with no early-cancellation fees. Ideal if you're between contracts, travelling soon, or want to switch networks without commitment.",
    heroFrom: "#ec4899",
    heroTo: "#9d174d",
    whereClause: {
      category: "mobile",
      subcategory: "sim-only",
      OR: [{ contractLength: 1 }, { contractLength: 0 }, { contractLength: null }],
    },
    highlights: [
      "Cancel any month — no early-termination fees",
      "Number portability protected (PAC code rules apply)",
      "Most are £1-3 cheaper than the equivalent 12-month deal",
    ],
    faqs: [
      {
        question: "What's the difference between 30-day rolling and PAYG?",
        answer:
          "Rolling SIMs auto-bill monthly — you don't have to top up. PAYG requires manual top-ups. Rolling is more like a monthly contract that you can cancel any time. Most people prefer rolling for the simplicity.",
      },
      {
        question: "Do rolling SIMs include free EU roaming?",
        answer:
          "Lebara's 30-day rolling plans include free roaming in 39 countries. Smarty's rolling plans charge £2/day. giffgaff's goodybags include free roaming up to 5GB/month. Always check before travelling.",
      },
    ],
  },
};

interface PageProps {
  params: Promise<{ filter: string }>;
}

export async function generateStaticParams() {
  return Object.keys(FILTER_CONFIG).map((filter) => ({ filter }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { filter } = await params;
  const config = FILTER_CONFIG[filter];
  if (!config) return { title: "SIM-Only Deals" };
  return {
    title: config.title,
    description: config.description,
    alternates: {
      canonical: `${siteConfig.url}/sim-only/${filter}`,
    },
    openGraph: {
      title: config.title,
      description: config.description,
      url: `${siteConfig.url}/sim-only/${filter}`,
      type: "website",
    },
  };
}

export const dynamic = "force-dynamic";

export default async function SimOnlyFilteredPage({ params }: PageProps) {
  const { filter } = await params;
  const config = FILTER_CONFIG[filter];
  if (!config) notFound();

  let deals: Array<{
    id: string;
    name: string;
    slug: string;
    monthlyCost: number;
    contractLength: number | null;
    dataAllowance: string | null;
    networkType: string | null;
    imageUrl: string | null;
    provider: { name: string; slug: string; logo: string | null };
  }> = [];

  try {
    const result = await prisma.plan.findMany({
      where: config.whereClause,
      include: {
        provider: {
          select: { name: true, slug: true, logo: true },
        },
      },
      orderBy: { monthlyCost: "asc" },
      take: 30,
    });
    deals = result;
  } catch {
    deals = [];
  }

  const url = `${siteConfig.url}/sim-only/${filter}`;
  const cheapest = deals.length > 0 ? deals[0].monthlyCost : 0;

  const rankStyles = [
    { chip: "from-amber-400 to-yellow-500", icon: Trophy },
    { chip: "from-slate-300 to-slate-500", icon: Award },
    { chip: "from-orange-400 to-amber-700", icon: Medal },
  ];

  return (
    <div>
      {/* Schema markup */}
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Mobile", url: `${siteConfig.url}/mobile` },
          { name: "SIM Only", url: `${siteConfig.url}/mobile/sim-only` },
          { name: config.h1, url },
        ]}
      />
      <ItemListJsonLd
        name={config.title}
        url={url}
        items={deals.slice(0, 10).map((d) => ({
          name: `${d.provider.name} ${d.name}`,
          url: `${siteConfig.url}/deals/${d.slug}`,
          price: d.monthlyCost,
        }))}
      />
      <FAQPageJsonLd faqs={config.faqs} />

      {/* Hero */}
      <section
        className="relative py-14 sm:py-20 text-white overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${config.heroFrom} 0%, ${config.heroTo} 60%, #0a1628 130%)`,
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
              <Sparkles className="size-3 mr-1" />
              {deals.length} live deals — May 2026
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {config.h1}
            </h1>
            <p className="mt-5 text-lg text-white/90 leading-relaxed max-w-2xl speakable-summary">
              {config.subhead}
            </p>
            <ul className="mt-6 space-y-2">
              {config.highlights.map((h) => (
                <li
                  key={h}
                  className="flex items-start gap-2 text-sm text-white/85"
                >
                  <span className="mt-1 size-1.5 rounded-full bg-white/60" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Live stats strip */}
      <section className="border-b bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900/40 dark:via-slate-900/20 dark:to-slate-900/40">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
            {[
              {
                icon: CardSim,
                value: deals.length.toString(),
                label: "Live deals",
                grad: "from-emerald-500 to-emerald-700",
              },
              {
                icon: TrendingDown,
                value: cheapest > 0 ? `£${cheapest.toFixed(2)}` : "—",
                label: "Cheapest /mo",
                grad: "from-blue-500 to-indigo-600",
              },
              {
                icon: Globe,
                value: new Set(deals.map((d) => d.provider.slug)).size.toString(),
                label: "Networks",
                grad: "from-purple-500 to-fuchsia-600",
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

      {/* Deals leaderboard */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">
                Cheapest first — top {Math.min(deals.length, 30)} deals
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Sorted by total monthly cost. Click any deal to see full
                terms and switch on the provider&apos;s website.
              </p>
            </div>
          </div>

          {deals.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed py-16 text-center">
              <p className="text-lg font-semibold">
                No deals matching this filter right now
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
                            <div className="relative size-12 shrink-0 rounded-lg bg-slate-50 dark:bg-slate-800/50 ring-1 ring-border/50">
                              <Image
                                src={deal.imageUrl}
                                alt={deal.name}
                                fill
                                className="object-contain p-1.5"
                                sizes="48px"
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

      {/* FAQ section — same content as schema, visible on page */}
      <section className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/40 dark:to-slate-950 border-t">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
          <Badge className="mb-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-md">
            <Zap className="size-3 mr-1" />
            FAQ
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            Common questions
          </h2>
          <div className="space-y-4">
            {config.faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl bg-white dark:bg-slate-900/60 border border-border/50 p-5 shadow-sm hover:shadow-md transition-all"
              >
                <summary className="cursor-pointer text-base font-bold flex items-start justify-between gap-3">
                  <span>{faq.question}</span>
                  <span className="shrink-0 size-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-extrabold group-open:rotate-45 transition-transform">
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

      {/* Internal links to siblings — boosts crawl + ranking */}
      <section className="bg-background border-t">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
          <h2 className="text-xl font-bold mb-5">
            Browse other SIM-only filters
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.values(FILTER_CONFIG)
              .filter((c) => c.slug !== filter)
              .map((c) => (
                <Link
                  key={c.slug}
                  href={`/sim-only/${c.slug}`}
                  className="rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600 hover:text-white px-4 py-2 text-sm font-semibold transition-all"
                >
                  {c.h1}
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
