import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Check,
  X,
  Sparkles,
  Award,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/seo";
import { getBrandColor } from "@/config/brand-colors";
import { ProviderLogo } from "@/components/shared/provider-logo";
import {
  BreadcrumbJsonLd,
  FAQPageJsonLd,
  ArticleJsonLd,
} from "@/components/shared/json-ld";

/**
 * Programmatic head-to-head comparison pages — `/compare/[matchup]`.
 *
 * High commercial-intent search query. People typing "vodafone vs
 * talkmobile" are far down the funnel — they're choosing.  Each page
 * pulls live affiliate prices from both providers, scores them on the
 * dimensions buyers care about, and emits FAQ + Article schema for
 * rich-result eligibility.
 *
 * Adding a new matchup = one row in MATCHUPS.  No schema changes.
 */

interface Matchup {
  /** URL slug, format `provider-a-vs-provider-b` */
  slug: string;
  providerA: { slug: string; name: string };
  providerB: { slug: string; name: string };
  /** SEO title (50-60 chars) */
  title: string;
  /** Meta description (150-160 chars) */
  description: string;
  /** H1 — usually mirrors title */
  h1: string;
  subhead: string;
  /** What's the same between them */
  shared: string[];
  /** Dimensions where one beats the other */
  dimensions: {
    name: string;
    aWins: boolean;
    bWins: boolean;
    /** Plain-English explanation, ≤140 chars */
    note: string;
  }[];
  /** Verdict — who should pick which */
  verdict: {
    pickA: string;
    pickB: string;
  };
  faqs: { question: string; answer: string }[];
}

const MATCHUPS: Record<string, Matchup> = {
  "vodafone-vs-talkmobile": {
    slug: "vodafone-vs-talkmobile",
    providerA: { slug: "vodafone", name: "Vodafone" },
    providerB: { slug: "talkmobile", name: "Talkmobile" },
    title: "Vodafone vs Talkmobile 2026 — Same Network, Half Price?",
    description:
      "Talkmobile uses Vodafone's network at half the price. Live UK price comparison, 5 trade-offs, who should pick which. Awin verified deals.",
    h1: "Vodafone vs Talkmobile",
    subhead:
      "Talkmobile is owned by Vodafone and uses Vodafone's exact network — so why does the same data cost half the price? Here's the honest head-to-head.",
    shared: [
      "Identical UK network coverage (Vodafone masts, antennas, 5G)",
      "Same EU roaming countries available",
      "Both let you keep your number via PAC code",
    ],
    dimensions: [
      {
        name: "Headline price (50GB SIM-only)",
        aWins: false,
        bWins: true,
        note: "Talkmobile £8/mo vs Vodafone £18/mo — same data, same network",
      },
      {
        name: "Customer service",
        aWins: true,
        bWins: false,
        note: "Vodafone has 24/7 phone + stores. Talkmobile is chat 8am-8pm.",
      },
      {
        name: "Network priority during congestion",
        aWins: true,
        bWins: false,
        note: "Vodafone customers get bandwidth priority on busy masts.",
      },
      {
        name: "EU roaming included",
        aWins: false,
        bWins: false,
        note: "Both charge daily — Vodafone £2.81, Talkmobile £1.99.",
      },
      {
        name: "Phone bundles available",
        aWins: true,
        bWins: false,
        note: "Vodafone sells iPhone/Galaxy/Pixel on contract. Talkmobile is SIM-only.",
      },
      {
        name: "Data rollover",
        aWins: true,
        bWins: false,
        note: "Vodafone Pro tier rolls over unused data. Talkmobile doesn't.",
      },
      {
        name: "12-month price stability",
        aWins: false,
        bWins: true,
        note: "Talkmobile holds prices flat. Vodafone bumped by £2.50 in April 2026.",
      },
    ],
    verdict: {
      pickA:
        "Pick Vodafone if you need 24/7 support, in-store help, or a new phone bundled in.",
      pickB:
        "Pick Talkmobile if you want the same Vodafone network for £90-180/yr less. For most users, this is the right answer.",
    },
    faqs: [
      {
        question: "Does Talkmobile use the same network as Vodafone?",
        answer:
          "Yes. Talkmobile is wholly owned by Vodafone and uses Vodafone's exact network — same masts, same 5G antennas, same coverage. The only practical difference is congestion priority: Vodafone customers get bandwidth priority on busy masts.",
      },
      {
        question: "Why is Talkmobile so much cheaper than Vodafone?",
        answer:
          "Talkmobile is Vodafone's no-frills sub-brand designed to compete with budget MVNOs without dropping headline Vodafone tariff prices. The trade-offs are real but minor: chat-based support, no rollover, no phone bundles.",
      },
      {
        question: "Can I switch from Vodafone to Talkmobile and keep my number?",
        answer:
          "Yes. Text PAC to 65075 from your Vodafone number, sign up at Talkmobile.co.uk with the PAC code, and your number ports overnight. Old contract auto-cancels.",
      },
      {
        question: "Is Talkmobile reliable?",
        answer:
          "Yes — it's effectively Vodafone with different branding. Network reliability is identical. Customer-service quality is lower (chat + business hours only) but actual technical issues are rare.",
      },
    ],
  },
  "lebara-vs-talkmobile": {
    slug: "lebara-vs-talkmobile",
    providerA: { slug: "lebara", name: "Lebara" },
    providerB: { slug: "talkmobile", name: "Talkmobile" },
    title: "Lebara vs Talkmobile 2026 — Cheap UK SIMs Compared",
    description:
      "Lebara and Talkmobile both use Vodafone's network. Compare price, EU roaming, contract flexibility — find which UK SIM deal fits you in 2026.",
    h1: "Lebara vs Talkmobile",
    subhead:
      "Both use Vodafone's network. Both are sub-£10 budget brands. So how do you choose? It comes down to roaming, contract length and customer service.",
    shared: [
      "Both use Vodafone's UK network",
      "Both target the under-£10/mo SIM-only market",
      "Both let you keep your number via PAC code",
    ],
    dimensions: [
      {
        name: "Cheapest 30GB plan",
        aWins: false,
        bWins: true,
        note: "Talkmobile £8/mo (50GB) beats Lebara £9/mo (30GB) on raw value.",
      },
      {
        name: "EU roaming",
        aWins: true,
        bWins: false,
        note: "Lebara: free in 39 countries. Talkmobile: £1.99/day.",
      },
      {
        name: "Contract flexibility",
        aWins: true,
        bWins: false,
        note: "Lebara is 30-day rolling. Talkmobile's cheap deals are 12-month.",
      },
      {
        name: "International calls included",
        aWins: true,
        bWins: false,
        note: "Lebara includes minutes to ~40 countries. Talkmobile doesn't.",
      },
      {
        name: "Customer service hours",
        aWins: false,
        bWins: false,
        note: "Both run chat-based support during business hours only.",
      },
      {
        name: "Data rollover",
        aWins: true,
        bWins: false,
        note: "Lebara rolls over for 60 days. Talkmobile expires monthly.",
      },
    ],
    verdict: {
      pickA:
        "Pick Lebara if you travel internationally, call abroad, or want 30-day flexibility — cheaper total cost for travellers.",
      pickB:
        "Pick Talkmobile if you stay in the UK, want the most data per £, and don't mind a 12-month contract.",
    },
    faqs: [
      {
        question: "Which is cheaper, Lebara or Talkmobile?",
        answer:
          "Talkmobile is cheaper on headline UK price (£8/mo for 50GB vs Lebara's £9/mo for 30GB). For travellers, Lebara's free EU+ roaming saves £30-£60 per trip — making it net cheaper if you travel even twice a year.",
      },
      {
        question: "Do Lebara and Talkmobile use the same network?",
        answer:
          "Yes. Both run on Vodafone's UK network — same masts, same 5G coverage. Speed and signal will be identical at any given location.",
      },
      {
        question: "Which has better customer service?",
        answer:
          "Both are chat-based and business-hours-only. Lebara has slightly faster response times (typically 20-30 mins vs Talkmobile's 30-60). Neither has phone or in-store support.",
      },
      {
        question: "Can I switch between them and keep my number?",
        answer:
          "Yes. Text PAC to 65075 from your current SIM to get a transfer code, sign up with the new provider using that code. Number ports within 24 hours.",
      },
    ],
  },
  "be-fibre-vs-bt-broadband": {
    slug: "be-fibre-vs-bt-broadband",
    providerA: { slug: "be-fibre", name: "Be Fibre" },
    providerB: { slug: "bt", name: "BT" },
    title: "Be Fibre vs BT Broadband 2026 — Speed, Price, Coverage",
    description:
      "Be Fibre is the altnet challenger; BT is the incumbent. Compare gigabit prices, install reliability, customer service. Awin verified deals 2026.",
    h1: "Be Fibre vs BT Broadband",
    subhead:
      "Be Fibre runs its own full-fibre network in growing UK postcodes. BT runs Britain's biggest broadband brand on Openreach's network. Here's how they actually stack up.",
    shared: [
      "Both offer full-fibre in supported postcodes",
      "Both include router and standard installation",
      "Both fall under Ofcom's switching protection rules",
    ],
    dimensions: [
      {
        name: "Cheapest gigabit plan",
        aWins: true,
        bWins: false,
        note: "Be Fibre £39.50/mo (1000 Mbps) vs BT Full Fibre 900 at £49.99.",
      },
      {
        name: "Coverage / availability",
        aWins: false,
        bWins: true,
        note: "BT (via Openreach) covers ~78% of UK. Be Fibre is in select postcodes.",
      },
      {
        name: "Install reliability",
        aWins: true,
        bWins: false,
        note: "Be Fibre owns its network end-to-end — fewer engineer no-shows.",
      },
      {
        name: "Mid-contract price rises",
        aWins: true,
        bWins: false,
        note: "Be Fibre fixed pricing for full contract. BT bumps annually in April.",
      },
      {
        name: "Bundled TV / mobile",
        aWins: false,
        bWins: true,
        note: "BT bundles Sport, EE mobile, BT TV. Be Fibre is broadband-only.",
      },
      {
        name: "Customer service",
        aWins: false,
        bWins: false,
        note: "Both are mid-pack on Trustpilot. BT has phone, Be Fibre is chat-first.",
      },
      {
        name: "Upload speeds (symmetric)",
        aWins: true,
        bWins: false,
        note: "Be Fibre matches upload to download. BT throttles upload.",
      },
    ],
    verdict: {
      pickA:
        "Pick Be Fibre if available at your postcode — faster, cheaper, no annual hikes, full-symmetric speeds for remote work.",
      pickB:
        "Pick BT if Be Fibre isn't in your postcode, you want bundled TV/mobile, or you value phone-based support.",
    },
    faqs: [
      {
        question: "Is Be Fibre faster than BT?",
        answer:
          "At equivalent tiers, yes — Be Fibre offers symmetric upload/download (1000 Mbps both ways), while BT's Full Fibre 900 caps upload at 110 Mbps. For streamers, content creators, and remote workers, Be Fibre is meaningfully faster.",
      },
      {
        question: "Is Be Fibre available where I live?",
        answer:
          "Be Fibre is rolling out across the Midlands, North-West and Yorkshire. Check coverage at bemoreconnected.co.uk. If they're not yet at your postcode, BT (via Openreach) is the most likely full-fibre option.",
      },
      {
        question: "Can I switch from BT to Be Fibre easily?",
        answer:
          "Yes — but unlike Openreach-to-Openreach switches, this is a 'cross-network' switch which requires a separate Be Fibre install. Allow 2-4 weeks overlap; both providers support Ofcom's One Touch Switching framework as of 2025.",
      },
      {
        question: "Which is cheaper over 24 months?",
        answer:
          "Be Fibre. BT bumps prices in April every year (typically +£3-5/mo). Be Fibre's contracts include fixed pricing for the full 24 months. Total saving over a 2-year contract is typically £80-£150.",
      },
    ],
  },
};

interface PageProps {
  params: Promise<{ matchup: string }>;
}

export async function generateStaticParams() {
  return Object.keys(MATCHUPS).map((matchup) => ({ matchup }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { matchup } = await params;
  const config = MATCHUPS[matchup];
  if (!config) return { title: "Comparison" };
  return {
    title: config.title,
    description: config.description,
    alternates: { canonical: `${siteConfig.url}/compare/${matchup}` },
    openGraph: {
      type: "article",
      title: config.title,
      description: config.description,
      url: `${siteConfig.url}/compare/${matchup}`,
    },
  };
}

export const dynamic = "force-dynamic";

async function loadProviderDeals(slug: string) {
  try {
    return await prisma.plan.findMany({
      where: {
        provider: { slug },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { monthlyCost: "asc" },
      take: 4,
      include: {
        provider: { select: { name: true, slug: true, logo: true } },
      },
    });
  } catch {
    return [];
  }
}

export default async function ComparePage({ params }: PageProps) {
  const { matchup } = await params;
  const config = MATCHUPS[matchup];
  if (!config) notFound();

  const [aDeals, bDeals] = await Promise.all([
    loadProviderDeals(config.providerA.slug),
    loadProviderDeals(config.providerB.slug),
  ]);

  const url = `${siteConfig.url}/compare/${matchup}`;
  const brandA = getBrandColor(config.providerA.slug);
  const brandB = getBrandColor(config.providerB.slug);
  const aFrom = brandA?.from ?? "#1a365d";
  const aTo = brandA?.to ?? "#2a4a7f";
  const bFrom = brandB?.from ?? "#38a169";
  const bTo = brandB?.to ?? "#2f855a";

  const cheapestA = aDeals.length > 0 ? aDeals[0].monthlyCost : null;
  const cheapestB = bDeals.length > 0 ? bDeals[0].monthlyCost : null;

  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Guides", url: `${siteConfig.url}/guides` },
          { name: config.h1, url },
        ]}
      />
      <ArticleJsonLd
        title={config.title}
        description={config.description}
        url={url}
        author="ValueSwitch Editors"
      />
      <FAQPageJsonLd faqs={config.faqs} />

      {/* Split hero — both brand colours */}
      <section className="relative overflow-hidden text-white">
        <div className="grid grid-cols-2">
          <div
            className="px-4 py-14 sm:py-20 sm:px-6 lg:px-8 relative"
            style={{
              background: `linear-gradient(135deg, ${aFrom} 0%, ${aTo} 130%)`,
            }}
          >
            <div className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            <div className="relative text-right pr-2 sm:pr-6 lg:pr-12">
              <p className="text-xs font-bold uppercase tracking-wider text-white/70">
                Provider A
              </p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mt-1">
                {config.providerA.name}
              </p>
              {cheapestA !== null && (
                <p className="text-sm text-white/85 mt-1">
                  from £{cheapestA.toFixed(2)}/mo
                </p>
              )}
            </div>
          </div>
          <div
            className="px-4 py-14 sm:py-20 sm:px-6 lg:px-8 relative"
            style={{
              background: `linear-gradient(225deg, ${bFrom} 0%, ${bTo} 130%)`,
            }}
          >
            <div className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            <div className="relative pl-2 sm:pl-6 lg:pl-12">
              <p className="text-xs font-bold uppercase tracking-wider text-white/70">
                Provider B
              </p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mt-1">
                {config.providerB.name}
              </p>
              {cheapestB !== null && (
                <p className="text-sm text-white/85 mt-1">
                  from £{cheapestB.toFixed(2)}/mo
                </p>
              )}
            </div>
          </div>
        </div>
        {/* VS chip */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex size-16 sm:size-20 items-center justify-center rounded-full bg-white text-slate-900 font-extrabold text-xl sm:text-2xl shadow-2xl ring-4 ring-white/30">
            VS
          </div>
        </div>
      </section>

      {/* Page intro */}
      <section className="bg-background border-b">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <Badge className="mb-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-md">
            <Sparkles className="size-3 mr-1" />
            Honest comparison
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            {config.h1}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed speakable-summary">
            {config.subhead}
          </p>
        </div>
      </section>

      {/* What's the same */}
      <section className="bg-gradient-to-r from-slate-50 to-emerald-50 dark:from-slate-900/40 dark:to-emerald-950/40">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-14">
          <h2 className="text-xl sm:text-2xl font-bold mb-5 flex items-center gap-2">
            <Check className="size-6 text-emerald-600" />
            What&apos;s the same
          </h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {config.shared.map((s) => (
              <li
                key={s}
                className="flex items-start gap-2 text-sm bg-white dark:bg-slate-900/60 rounded-xl border border-border/40 p-4"
              >
                <Check className="size-4 mt-0.5 text-emerald-600 shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Head-to-head dimensions */}
      <section className="bg-background">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            Where they differ
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            Six dimensions that actually matter when choosing between them.
          </p>
          <div className="space-y-3">
            {config.dimensions.map((dim) => (
              <div
                key={dim.name}
                className="rounded-2xl border border-border/60 bg-white dark:bg-slate-900/80 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="grid grid-cols-12 gap-3 items-center p-4 sm:p-5">
                  <div className="col-span-12 sm:col-span-5">
                    <h3 className="font-bold text-sm sm:text-base">
                      {dim.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-snug">
                      {dim.note}
                    </p>
                  </div>
                  <div className="col-span-6 sm:col-span-3 flex items-center justify-center">
                    {dim.aWins ? (
                      <div
                        className="rounded-full px-3 py-1.5 text-white font-bold text-xs flex items-center gap-1 shadow-md"
                        style={{
                          background: `linear-gradient(135deg, ${aFrom}, ${aTo})`,
                        }}
                      >
                        <Award className="size-3.5" />
                        {config.providerA.name} wins
                      </div>
                    ) : dim.bWins ? (
                      <div className="text-muted-foreground text-xs">—</div>
                    ) : (
                      <div className="text-amber-600 text-xs font-medium flex items-center gap-1">
                        <X className="size-3" />
                        Tie
                      </div>
                    )}
                  </div>
                  <div className="col-span-6 sm:col-span-3 flex items-center justify-center">
                    {dim.bWins ? (
                      <div
                        className="rounded-full px-3 py-1.5 text-white font-bold text-xs flex items-center gap-1 shadow-md"
                        style={{
                          background: `linear-gradient(135deg, ${bFrom}, ${bTo})`,
                        }}
                      >
                        <Award className="size-3.5" />
                        {config.providerB.name} wins
                      </div>
                    ) : dim.aWins ? (
                      <div className="text-muted-foreground text-xs">—</div>
                    ) : null}
                  </div>
                  <div className="hidden sm:flex col-span-1 items-center justify-end">
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verdict — pick which */}
      <section className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/40 dark:to-slate-950 border-y">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
            Which should you pick?
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div
              className="rounded-2xl p-6 text-white shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${aFrom}, ${aTo})`,
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <ProviderLogo
                  name={config.providerA.name}
                  slug={config.providerA.slug}
                  size={42}
                />
                <h3 className="text-xl font-bold">{config.providerA.name}</h3>
              </div>
              <p className="text-sm text-white/95 leading-relaxed">
                {config.verdict.pickA}
              </p>
              {cheapestA !== null && (
                <Button
                  asChild
                  className="mt-4 bg-white text-slate-900 hover:bg-white/90 font-semibold"
                >
                  <Link href={`/providers/${config.providerA.slug}`}>
                    View {config.providerA.name} plans
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              )}
            </div>
            <div
              className="rounded-2xl p-6 text-white shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${bFrom}, ${bTo})`,
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <ProviderLogo
                  name={config.providerB.name}
                  slug={config.providerB.slug}
                  size={42}
                />
                <h3 className="text-xl font-bold">{config.providerB.name}</h3>
              </div>
              <p className="text-sm text-white/95 leading-relaxed">
                {config.verdict.pickB}
              </p>
              {cheapestB !== null && (
                <Button
                  asChild
                  className="mt-4 bg-white text-slate-900 hover:bg-white/90 font-semibold"
                >
                  <Link href={`/providers/${config.providerB.slug}`}>
                    View {config.providerB.name} plans
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Live deals from each provider */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8">
            Current deals — live affiliate prices
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="size-8 rounded-lg shadow-md"
                  style={{
                    background: `linear-gradient(135deg, ${aFrom}, ${aTo})`,
                  }}
                />
                <h3 className="text-lg font-bold">
                  Top {config.providerA.name} deals
                </h3>
              </div>
              {aDeals.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No live deals available right now.
                </p>
              ) : (
                <div className="space-y-3">
                  {aDeals.slice(0, 3).map((d) => (
                    <Link
                      key={d.id}
                      href={`/deals/${d.slug}`}
                      className="block group"
                    >
                      <div className="rounded-xl border border-border/60 hover:border-border bg-white dark:bg-slate-900/60 p-4 hover:shadow-lg transition-all">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {d.provider.name}
                        </p>
                        <p className="text-sm font-bold leading-tight mt-0.5 line-clamp-2">
                          {d.name.replace(/ - £[\d.]+\/mo.*/, "")}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div
                            className="rounded-md px-2.5 py-1 text-white text-sm font-bold tabular-nums shadow-sm"
                            style={{
                              background: `linear-gradient(135deg, ${aFrom}, ${aTo})`,
                            }}
                          >
                            £{d.monthlyCost.toFixed(2)}/mo
                          </div>
                          <ArrowRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="size-8 rounded-lg shadow-md"
                  style={{
                    background: `linear-gradient(135deg, ${bFrom}, ${bTo})`,
                  }}
                />
                <h3 className="text-lg font-bold">
                  Top {config.providerB.name} deals
                </h3>
              </div>
              {bDeals.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No live deals available right now.
                </p>
              ) : (
                <div className="space-y-3">
                  {bDeals.slice(0, 3).map((d) => (
                    <Link
                      key={d.id}
                      href={`/deals/${d.slug}`}
                      className="block group"
                    >
                      <div className="rounded-xl border border-border/60 hover:border-border bg-white dark:bg-slate-900/60 p-4 hover:shadow-lg transition-all">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {d.provider.name}
                        </p>
                        <p className="text-sm font-bold leading-tight mt-0.5 line-clamp-2">
                          {d.name.replace(/ - £[\d.]+\/mo.*/, "")}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div
                            className="rounded-md px-2.5 py-1 text-white text-sm font-bold tabular-nums shadow-sm"
                            style={{
                              background: `linear-gradient(135deg, ${bFrom}, ${bTo})`,
                            }}
                          >
                            £{d.monthlyCost.toFixed(2)}/mo
                          </div>
                          <ArrowRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/40 dark:to-slate-950 border-t">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
          <Badge className="mb-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-md">
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

      {/* Other matchups — internal linking */}
      <section className="bg-background border-t">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
          <h2 className="text-xl font-bold mb-5">
            Other head-to-head comparisons
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.values(MATCHUPS)
              .filter((m) => m.slug !== matchup)
              .map((m) => (
                <Link
                  key={m.slug}
                  href={`/compare/${m.slug}`}
                  className="group rounded-xl border border-border/60 bg-white dark:bg-slate-900/60 p-4 hover:shadow-md hover:border-foreground/30 transition-all"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Compare
                  </p>
                  <p className="text-sm font-bold mt-1">{m.h1}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {m.subhead}
                  </p>
                  <span className="mt-2 inline-flex items-center text-xs font-bold text-foreground">
                    Read comparison
                    <ArrowRight className="ml-1 size-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}

