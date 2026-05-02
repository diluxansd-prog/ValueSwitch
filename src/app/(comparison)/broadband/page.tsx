import type { Metadata } from "next";
import Link from "next/link";
import {
  Wifi,
  ShieldCheck,
  TrendingDown,
  Clock,
  Zap,
  ExternalLink,
  Sparkles,
  Gauge,
  Tv,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProviderLogo } from "@/components/shared/provider-logo";
import { prisma } from "@/lib/prisma";
import { getBrandColor } from "@/config/brand-colors";

export const metadata: Metadata = {
  title: "Compare Full-Fibre Broadband Deals UK",
  description:
    "Compare the best UK full-fibre broadband deals — gigabit speeds, no-contract options, and real monthly prices. Updated daily from Be Fibre and other Awin partners.",
};

export const dynamic = "force-dynamic";

async function getBroadbandDeals() {
  return prisma.plan.findMany({
    where: { category: "broadband" },
    include: { provider: true },
    orderBy: { monthlyCost: "asc" },
  });
}

async function getBroadbandStats() {
  try {
    const [total, providers, fastest, lastUpdate] = await Promise.all([
      prisma.plan.count({ where: { category: "broadband" } }),
      prisma.plan
        .findMany({
          where: { category: "broadband" },
          select: { providerId: true },
          distinct: ["providerId"],
        })
        .then((p) => p.length),
      prisma.plan.aggregate({
        where: { category: "broadband" },
        _max: { downloadSpeed: true },
      }),
      prisma.plan.findFirst({
        where: { category: "broadband" },
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
    ]);
    return {
      total,
      providers,
      fastest: fastest._max.downloadSpeed ?? 0,
      lastUpdate: lastUpdate?.updatedAt ?? null,
    };
  } catch {
    return { total: 0, providers: 0, fastest: 0, lastUpdate: null };
  }
}

const fmtRel = (d: Date | null) => {
  if (!d) return "today";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

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

export default async function BroadbandPage() {
  const [deals, stats] = await Promise.all([
    getBroadbandDeals(),
    getBroadbandStats(),
  ]);

  const cheapest =
    deals.length > 0 ? Math.min(...deals.map((d) => d.monthlyCost)) : 0;

  return (
    <div>
      {/* Hero — cinematic gradient */}
      <section className="relative bg-gradient-to-br from-[#0a1628] via-[#1a365d] to-[#2a4a7f] text-white overflow-hidden">
        {/* Animated wifi pulse */}
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

        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-gradient-to-r from-purple-400 to-fuchsia-500 text-white border-0 shadow-lg">
              <Sparkles className="size-3 mr-1" />
              Full-fibre broadband
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Compare UK fibre broadband
              <span className="block mt-2 bg-gradient-to-r from-purple-300 via-fuchsia-200 to-purple-300 bg-clip-text text-transparent">
                without the bill shock.
              </span>
            </h1>
            <p className="mt-5 text-lg text-blue-100/90 leading-relaxed max-w-2xl">
              Gigabit-ready full-fibre packages from Be Fibre and other UK
              providers. Real monthly prices, no marketing fluff.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                asChild
                className="bg-white text-[#1a365d] hover:bg-blue-50 font-bold px-8 shadow-lg"
              >
                <Link href="/broadband/fibre">
                  <Wifi className="size-5" />
                  Browse fibre deals
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/40 bg-white/10 backdrop-blur text-white hover:bg-white/20 font-bold px-8"
              >
                <Link href="/broadband/speed-test">
                  <Gauge className="size-5" />
                  Run a speed test
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Live stats bar */}
      <section className="border-b bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900/40 dark:via-slate-900/20 dark:to-slate-900/40">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
            {[
              {
                icon: Wifi,
                value: stats.total.toString(),
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
                  stats.fastest >= 1000
                    ? `${(stats.fastest / 1000).toFixed(0)} Gb`
                    : `${stats.fastest}M`,
                label: "Top speed",
                grad: "from-blue-500 to-indigo-600",
              },
              {
                icon: Clock,
                value: fmtRel(stats.lastUpdate),
                label: "Last refresh",
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

      {/* Quick category links */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                href: "/broadband/fibre",
                icon: Wifi,
                title: "Full-fibre",
                desc: "100–1000 Mbps no-copper packages",
                grad: "from-purple-500 to-fuchsia-600",
                bg: "from-purple-50 to-fuchsia-50 dark:from-purple-950/40 dark:to-fuchsia-950/40",
              },
              {
                href: "/broadband/tv-packages",
                icon: Tv,
                title: "Broadband + TV",
                desc: "Bundles that include streaming",
                grad: "from-rose-500 to-pink-600",
                bg: "from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40",
              },
              {
                href: "/broadband/speed-test",
                icon: Gauge,
                title: "Speed test",
                desc: "See what you're actually getting",
                grad: "from-blue-500 to-indigo-600",
                bg: "from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40",
              },
            ].map((tile) => (
              <Link key={tile.href} href={tile.href} className="group">
                <div
                  className={`relative rounded-2xl bg-gradient-to-br ${tile.bg} border border-border/50 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden`}
                >
                  <div
                    className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${tile.grad}`}
                  />
                  <div
                    className={`flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${tile.grad} text-white shadow-md group-hover:scale-110 group-hover:-rotate-6 transition-transform mb-4`}
                  >
                    <tile.icon className="size-6" />
                  </div>
                  <h3 className="font-bold text-lg">{tile.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {tile.desc}
                  </p>
                  <span className="mt-4 inline-flex items-center text-sm font-bold">
                    Open
                    <ArrowRight className="ml-1 size-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Deals grid */}
      <section className="bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900/40 dark:via-slate-950 dark:to-slate-900/40">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <Badge className="mb-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-md">
                <ShieldCheck className="size-3 mr-1" />
                Awin verified
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {deals.length} fibre deal{deals.length !== 1 ? "s" : ""}
                {deals.length > 0 && (
                  <span className="ml-2 text-base font-normal text-muted-foreground">
                    from £{cheapest.toFixed(2)}/mo
                  </span>
                )}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Sorted cheapest first. Click through and complete the order on
                the provider&apos;s site.
              </p>
            </div>
          </div>

          {deals.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="p-12 text-center">
                <Wifi className="mx-auto size-12 text-muted-foreground/40 mb-4" />
                <p className="text-lg font-semibold">No fibre deals yet</p>
                <p className="mt-2 text-muted-foreground">
                  We&apos;re onboarding broadband partners — come back soon.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {deals.map((deal) => {
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
                    {/* Speed-tier band */}
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

                      {/* Speed callout with gradient bar */}
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
                          {/* Visual speed bar */}
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

                      {/* Brand-coloured price tile */}
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

                      {deal.description && (
                        <p className="mb-4 text-xs text-muted-foreground line-clamp-2">
                          {deal.description}
                        </p>
                      )}

                      <Button
                        asChild
                        className="w-full bg-gradient-to-r from-[#1a365d] to-[#38a169] hover:from-[#2a4a7f] hover:to-[#48bb78] text-white border-0 font-semibold shadow-md group-hover:shadow-lg transition-all"
                      >
                        <a
                          href={`/api/redirect?plan=${deal.id}&src=broadband_card`}
                          target="_blank"
                          rel="noopener noreferrer nofollow sponsored"
                        >
                          View deal
                          <ExternalLink className="size-4" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Postcode hint */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
          <div className="rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                <MapPin className="size-7" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold">
                  Check what&apos;s actually available at your postcode
                </h3>
                <p className="text-sm sm:text-base text-blue-100 mt-1">
                  Full-fibre coverage varies street by street. Run an Ofcom
                  postcode check before you commit.
                </p>
              </div>
              <Button
                size="lg"
                asChild
                className="bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-lg shrink-0"
              >
                <a
                  href="https://checker.ofcom.org.uk/en-gb/broadband-coverage"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ofcom checker
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Helpful info */}
      <section className="border-t bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/40 dark:to-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="text-center mb-10">
            <Badge className="mb-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-md">
              Buying tips
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold">
              What to look for in a fibre deal
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                icon: Zap,
                grad: "from-yellow-500 to-amber-600",
                title: "Speed (Mbps)",
                body:
                  "For 1-2 person households, 100 Mbps is plenty. Families with streaming + gaming should look at 500 Mbps+. Gigabit (1000 Mbps) is future-proofing.",
              },
              {
                icon: Clock,
                grad: "from-purple-500 to-fuchsia-600",
                title: "Contract length",
                body:
                  "12-month contracts cost a few pounds more per month but give flexibility. 24-month locks in a lower price — watch for mid-contract price-rise clauses.",
              },
              {
                icon: ShieldCheck,
                grad: "from-emerald-500 to-teal-600",
                title: "Setup fees",
                body:
                  "Most full-fibre providers offer free installation and a free router. Check the small print for delivery and activation fees before checkout.",
              },
            ].map((tip) => (
              <div
                key={tip.title}
                className="rounded-2xl bg-white dark:bg-slate-900/80 border border-border/50 p-6 shadow-sm hover:shadow-lg transition-all"
              >
                <div
                  className={`flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${tip.grad} text-white shadow-md mb-4`}
                >
                  <tip.icon className="size-5" />
                </div>
                <h3 className="font-bold text-lg mb-2">{tip.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tip.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
