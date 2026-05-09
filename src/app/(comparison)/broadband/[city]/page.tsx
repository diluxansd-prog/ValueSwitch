import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Wifi,
  ShieldCheck,
  TrendingDown,
  Clock,
  Zap,
  ExternalLink,
  Sparkles,
  MapPin,
  Building2,
  Gauge,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProviderLogo } from "@/components/shared/provider-logo";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/seo";
import { getBrandColor } from "@/config/brand-colors";
import {
  BreadcrumbJsonLd,
  ItemListJsonLd,
  FAQPageJsonLd,
} from "@/components/shared/json-ld";
import { UK_CITIES, getCityBySlug } from "@/lib/seo/uk-cities";

/**
 * Programmatic city-level broadband landing pages — `/broadband/[city]`.
 *
 * Targets long-tail "broadband <city>" queries.  Each city page has
 * unique hand-authored coverage copy + a postcode prefix list (so it
 * doesn't read like the others), then live UK-wide deals from our
 * Awin partners (because no provider feeds us city-filtered prices —
 * every UK fibre deal is potentially available subject to postcode
 * checks).
 *
 * Honesty disclosure: the deals shown are UK-wide, not address-checked.
 * The page tells readers to run an Ofcom postcode check before signing.
 */

interface PageProps {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  return UK_CITIES.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { city } = await params;
  const ukCity = getCityBySlug(city);
  if (!ukCity) return { title: "Broadband Deals" };

  const title = `${ukCity.name} Broadband Deals 2026 — Compare Full-Fibre`;
  const description = `Compare full-fibre broadband deals available in ${ukCity.name} (${ukCity.region}). Live UK prices, real Awin-verified affiliate links. Updated weekly.`;
  return {
    title,
    description,
    alternates: { canonical: `${siteConfig.url}/broadband/${city}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${siteConfig.url}/broadband/${city}`,
    },
  };
}

export const dynamic = "force-dynamic";

async function getDeals() {
  try {
    return await prisma.plan.findMany({
      where: { category: "broadband" },
      include: { provider: true },
      orderBy: { monthlyCost: "asc" },
    });
  } catch {
    return [];
  }
}

function speedTier(mbps?: number | null): {
  label: string;
  text: string;
  bg: string;
  bar: string;
} {
  if (!mbps)
    return {
      label: "Standard",
      text: "text-slate-700 dark:text-slate-300",
      bg: "bg-slate-100 dark:bg-slate-800",
      bar: "from-slate-400 to-slate-600",
    };
  if (mbps >= 900)
    return {
      label: "Gigabit",
      text: "text-emerald-700 dark:text-emerald-300",
      bg: "bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-950/40 dark:to-teal-950/40",
      bar: "from-emerald-500 to-teal-600",
    };
  if (mbps >= 500)
    return {
      label: "Ultrafast",
      text: "text-blue-700 dark:text-blue-300",
      bg: "bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-950/40",
      bar: "from-blue-500 to-indigo-600",
    };
  if (mbps >= 100)
    return {
      label: "Superfast",
      text: "text-purple-700 dark:text-purple-300",
      bg: "bg-gradient-to-r from-purple-100 to-fuchsia-100 dark:from-purple-950/40 dark:to-fuchsia-950/40",
      bar: "from-purple-500 to-fuchsia-600",
    };
  return {
    label: "Standard",
    text: "text-slate-700 dark:text-slate-300",
    bg: "bg-slate-100 dark:bg-slate-800",
    bar: "from-slate-400 to-slate-600",
  };
}

export default async function CityBroadbandPage({ params }: PageProps) {
  const { city } = await params;
  const ukCity = getCityBySlug(city);
  if (!ukCity) notFound();

  const deals = await getDeals();
  const cheapest =
    deals.length > 0 ? Math.min(...deals.map((d) => d.monthlyCost)) : 0;
  const fastest =
    deals.length > 0
      ? Math.max(...deals.map((d) => d.downloadSpeed ?? 0))
      : 0;
  const url = `${siteConfig.url}/broadband/${city}`;

  // Per-city FAQ — re-uses copy but slots in the city name for unique
  // content that's still on-topic.
  const faqs = [
    {
      question: `Is full-fibre broadband available in ${ukCity.name}?`,
      answer: `Yes — full-fibre coverage in ${ukCity.name} is now widespread. ${ukCity.coverage} Always run an Ofcom postcode check at your specific address before signing a contract, as availability varies street by street.`,
    },
    {
      question: `What's the cheapest broadband deal in ${ukCity.name}?`,
      answer: `As of May 2026, the cheapest live deal we track that's potentially available in ${ukCity.name} starts at £${cheapest.toFixed(2)}/month. Final price depends on the postcode-level check at your address.`,
    },
    {
      question: `What broadband providers serve ${ukCity.name}?`,
      answer: `Major providers using Openreach (BT, Sky, Vodafone, EE, Plusnet, TalkTalk) cover most ${ukCity.name} postcodes.${ukCity.altnet ? ` ${ukCity.altnet} is a strong local altnet alternative often cheaper per Mbps.` : ""} Run a postcode check to see which apply at your address.`,
    },
    {
      question: `How fast is gigabit broadband in ${ukCity.name}?`,
      answer: `Gigabit (1000 Mbps) full-fibre is available in many ${ukCity.name} postcodes via both Openreach FTTP and altnets. Real-world speeds typically come within 90% of advertised speed on full-fibre — check thinkbroadband.com for actual results from neighbours.`,
    },
  ];

  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Broadband", url: `${siteConfig.url}/broadband` },
          { name: ukCity.name, url },
        ]}
      />
      <ItemListJsonLd
        name={`Broadband deals available in ${ukCity.name}`}
        url={url}
        items={deals.slice(0, 10).map((d) => ({
          name: `${d.provider.name} ${d.name}`,
          url: `${siteConfig.url}/deals/${d.slug}`,
          price: d.monthlyCost,
        }))}
      />
      <FAQPageJsonLd faqs={faqs} />

      {/* Hero — purple/blue cinematic with city callout */}
      <section className="relative bg-gradient-to-br from-[#0a1628] via-[#1a365d] to-[#2a4a7f] text-white overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl animate-pulse"
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
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-gradient-to-r from-purple-400 to-fuchsia-500 text-white border-0 shadow-lg">
              <MapPin className="size-3 mr-1" />
              {ukCity.region}
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {ukCity.name} broadband deals
              <span className="block mt-2 bg-gradient-to-r from-purple-300 via-fuchsia-200 to-purple-300 bg-clip-text text-transparent">
                full-fibre, real prices.
              </span>
            </h1>
            <p className="mt-5 text-lg text-blue-100/90 leading-relaxed max-w-2xl speakable-summary">
              {ukCity.coverage}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-blue-100/85">
              <Building2 className="size-4 text-blue-200" />
              <span>
                Population: {(ukCity.population / 1000).toFixed(0)}k ·
                Postcodes covered: {ukCity.postcodes.join(", ")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Live stats */}
      <section className="border-b bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900/40 dark:via-slate-900/20 dark:to-slate-900/40">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
            {[
              {
                icon: Wifi,
                value: deals.length.toString(),
                label: "Live deals",
                grad: "from-purple-500 to-fuchsia-600",
              },
              {
                icon: TrendingDown,
                value: cheapest > 0 ? `£${cheapest.toFixed(2)}` : "—",
                label: "Cheapest /mo",
                grad: "from-emerald-500 to-emerald-700",
              },
              {
                icon: Zap,
                value:
                  fastest >= 1000
                    ? `${(fastest / 1000).toFixed(0)} Gb`
                    : fastest > 0
                      ? `${fastest}M`
                      : "—",
                label: "Top speed",
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

      {/* Postcode-check disclosure card */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/40 p-5 flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
              <MapPin className="size-5 text-amber-700 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">
                Always run an address-level postcode check before signing
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                The deals below are UK-wide. Coverage in {ukCity.name} varies
                street by street — even within the same postcode. Run an{" "}
                <a
                  href="https://checker.ofcom.org.uk/en-gb/broadband-coverage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-semibold"
                >
                  Ofcom checker
                </a>{" "}
                or use the provider&apos;s own checker before committing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Deals grid */}
      {deals.length > 0 && (
        <section className="bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900/40 dark:via-slate-950 dark:to-slate-900/40">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
            <Badge className="mb-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-md">
              <ShieldCheck className="size-3 mr-1" />
              Awin verified
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              Top fibre deals — sorted cheapest first
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              Cheaper at the top. Click through, run the address check, and
              switch on the provider&apos;s site.
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {deals.slice(0, 9).map((deal) => {
                const tier = speedTier(deal.downloadSpeed);
                const brand = getBrandColor(deal.provider.slug);
                const priceGrad = brand
                  ? { from: brand.from, to: brand.to }
                  : { from: "#1a365d", to: "#38a169" };

                return (
                  <Card
                    key={deal.id}
                    className="group overflow-hidden border border-border/60 hover:shadow-2xl hover:-translate-y-1 hover:border-purple-200 dark:hover:border-purple-900 transition-all duration-300"
                  >
                    <div
                      className={`${tier.bg} px-5 py-3 flex items-center justify-between`}
                    >
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${tier.text}`}
                      >
                        {tier.label}
                      </span>
                      {deal.contractLength && (
                        <span className="text-xs text-muted-foreground font-medium">
                          {deal.contractLength} month
                        </span>
                      )}
                    </div>

                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <ProviderLogo
                          name={deal.provider.name}
                          slug={deal.provider.slug}
                          logo={deal.provider.logo}
                          size={44}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {deal.provider.name}
                          </p>
                          <h3 className="text-base font-bold leading-tight mt-0.5">
                            {deal.name}
                          </h3>
                        </div>
                      </div>

                      {deal.downloadSpeed && (
                        <div className="mb-4">
                          <div className="flex items-baseline gap-1 mb-1.5">
                            <span className="text-3xl font-extrabold tabular-nums">
                              {deal.downloadSpeed}
                            </span>
                            <span className="text-sm font-bold text-muted-foreground">
                              Mbps
                            </span>
                            <span className="ml-auto text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                              download
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${tier.bar} rounded-full`}
                              style={{
                                width: `${Math.min(100, (deal.downloadSpeed / 1000) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <div
                        className="rounded-xl px-4 py-3 text-white mb-4 shadow-md"
                        style={{
                          background: `linear-gradient(135deg, ${priceGrad.from}, ${priceGrad.to})`,
                        }}
                      >
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold tabular-nums">
                            £{deal.monthlyCost.toFixed(2)}
                          </span>
                          <span className="text-sm opacity-90 ml-0.5">
                            /month
                          </span>
                        </div>
                        {deal.setupFee > 0 ? (
                          <p className="text-[11px] opacity-90 mt-0.5">
                            + £{deal.setupFee.toFixed(2)} setup
                          </p>
                        ) : (
                          <p className="text-[11px] opacity-90 mt-0.5">
                            ✓ No setup fee
                          </p>
                        )}
                      </div>

                      <Button
                        asChild
                        className="w-full bg-gradient-to-r from-[#1a365d] to-[#38a169] hover:from-[#2a4a7f] hover:to-[#48bb78] text-white border-0 font-semibold shadow-md"
                      >
                        <a
                          href={`/api/redirect?plan=${deal.id}&src=broadband_${ukCity.slug}`}
                          target="_blank"
                          rel="noopener noreferrer nofollow sponsored"
                        >
                          Check at my address
                          <ExternalLink className="size-4" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Local context block */}
      <section className="bg-background">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
          <Badge className="mb-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-md">
            <Gauge className="size-3 mr-1" />
            Local coverage
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            What to expect in {ukCity.name}
          </h2>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p>{ukCity.coverage}</p>
            {ukCity.altnet && (
              <p>
                <strong>{ukCity.altnet}</strong> is the dominant local
                alternative-network provider in {ukCity.name}. Altnets
                typically offer faster symmetric speeds (matching upload to
                download) at lower per-Mbps prices than Openreach-based
                packages — but coverage is concentrated in select postcodes,
                so always check at your address first.
              </p>
            )}
            <p>
              Postcodes we regularly see well-served:{" "}
              {ukCity.postcodes.map((p, i) => (
                <span key={p}>
                  <code>{p}</code>
                  {i < ukCity.postcodes.length - 1 ? ", " : ""}
                </span>
              ))}
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/40 dark:to-slate-950 border-t">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
          <Badge className="mb-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-md">
            <Sparkles className="size-3 mr-1" />
            FAQ
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            {ukCity.name} broadband — common questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
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

      {/* Other cities — internal linking + crawl signal */}
      <section className="bg-background border-t">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
          <h2 className="text-xl font-bold mb-5">
            Compare broadband in other UK cities
          </h2>
          <div className="flex flex-wrap gap-2">
            {UK_CITIES.filter((c) => c.slug !== city)
              .slice(0, 14)
              .map((c) => (
                <Link
                  key={c.slug}
                  href={`/broadband/${c.slug}`}
                  className="rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-gradient-to-r hover:from-purple-500 hover:to-fuchsia-600 hover:text-white px-4 py-2 text-sm font-semibold transition-all flex items-center gap-1.5"
                >
                  <MapPin className="size-3" />
                  {c.name} broadband
                </Link>
              ))}
          </div>
          <div className="mt-6 text-center">
            <Button asChild variant="outline">
              <Link href="/broadband">
                View all UK broadband deals
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
