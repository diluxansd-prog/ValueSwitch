import type { Metadata } from "next";
import Link from "next/link";
import {
  CardSim,
  ShieldCheck,
  Globe,
  Calendar,
  TrendingDown,
  Filter,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProviderLogo } from "@/components/shared/provider-logo";
import {
  getOpinionatedBadges,
  TONE_STYLES,
} from "@/lib/opinionated-badges";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Cheap SIM Only Deals UK 2026 — Unlimited Data from £4.50/mo",
  description:
    "Compare every UK SIM-only deal — Lebara, Talkmobile, Vodafone, Ecotalk, 1pMobile and more. Free EU roaming options, 30-day rolling contracts, unlimited 5G data plans. Live prices, weekly updates.",
};

export const dynamic = "force-dynamic";

async function getSimOnly() {
  try {
    return await prisma.plan.findMany({
      where: {
        category: "mobile",
        subcategory: "sim-only",
      },
      include: { provider: true },
      orderBy: { monthlyCost: "asc" },
      take: 60,
    });
  } catch {
    return [];
  }
}

export default async function SimOnlyPage() {
  const deals = await getSimOnly();
  const cheapest = deals[0];
  const avgPrice =
    deals.length > 0
      ? deals.reduce((s, d) => s + d.monthlyCost, 0) / deals.length
      : 0;
  const networkCount = new Set(
    deals.map((d) => d.networkType).filter(Boolean)
  ).size;
  const providerCount = new Set(deals.map((d) => d.provider.id)).size;

  // Quick filter chips by data tier
  const tiers = [
    { label: "Unlimited", filter: (d: typeof deals[number]) => /unlimited/i.test(d.dataAllowance || "") },
    { label: "100GB+", filter: (d: typeof deals[number]) => /^[1-9]\d{2,}/.test((d.dataAllowance || "").replace(/[^\d]/g, "")) },
    { label: "Under £10/mo", filter: (d: typeof deals[number]) => d.monthlyCost < 10 },
    { label: "30-day rolling", filter: (d: typeof deals[number]) => d.contractLength === 1 },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-700 to-rose-700 text-white">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div
            className="absolute -bottom-32 -left-20 w-[500px] h-[500px] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.4), transparent 60%)",
            }}
          />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <Badge className="mb-3 border-white/20 bg-white/15 text-white">
            <CardSim className="size-3.5 mr-1.5" />
            {deals.length} live SIM-only deals · {providerCount} retailers
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            SIM-only deals — keep your phone, slash your bill
          </h1>
          <p className="mt-4 text-lg text-orange-50/90 leading-relaxed max-w-2xl">
            Got a phone you love? Drop your contract and put a SIM-only in
            it. Save £20-£40/month vs network upgrade pricing.
          </p>
          {cheapest && (
            <p className="mt-3 text-sm text-orange-50/80">
              Cheapest right now:{" "}
              <strong className="text-white">
                £{cheapest.monthlyCost.toFixed(2)}/mo
              </strong>{" "}
              from {cheapest.provider.name}
            </p>
          )}
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border/40">
            {[
              {
                icon: TrendingDown,
                value: cheapest ? `£${cheapest.monthlyCost.toFixed(2)}` : "—",
                label: "Cheapest",
                color: "text-emerald-600",
              },
              {
                icon: Globe,
                value: String(networkCount),
                label: "Networks",
                color: "text-blue-600",
              },
              {
                icon: Calendar,
                value: deals.filter((d) => d.contractLength === 1).length.toString(),
                label: "30-day rolling",
                color: "text-purple-600",
              },
              {
                icon: CardSim,
                value: deals
                  .filter((d) => /unlimited/i.test(d.dataAllowance || ""))
                  .length.toString(),
                label: "Unlimited data",
                color: "text-orange-600",
              },
            ].map((s) => (
              <div key={s.label} className="px-4 py-5 text-center">
                <s.icon className={cn("size-5 mx-auto mb-1.5", s.color)} />
                <p className="text-xl font-bold tabular-nums">{s.value}</p>
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick filters */}
      <section className="border-b bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="size-4 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Filter by what matters
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tiers.map((t) => {
              const count = deals.filter(t.filter).length;
              if (count === 0) return null;
              return (
                <Link
                  key={t.label}
                  href={`/mobile/compare?subcategory=sim-only&filter=${encodeURIComponent(t.label)}`}
                  className="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-background hover:bg-accent px-3 py-1.5 text-sm font-medium transition-all hover:scale-[1.03]"
                >
                  <span>{t.label}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {count}
                  </Badge>
                  <ArrowRight className="size-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                </Link>
              );
            })}
            <Link
              href="/guides/mobile/best-sim-only-for-eu-travel-2026"
              className="group inline-flex items-center gap-2 rounded-full border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 px-3 py-1.5 text-sm font-medium transition-all"
            >
              <Globe className="size-3.5" />
              <span>Free EU roaming guide</span>
              <ArrowRight className="size-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
            </Link>
          </div>
        </div>
      </section>

      {/* Deals grid */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <h2 className="text-2xl font-bold tracking-tight mb-6">
          Top {deals.length} SIM-only deals
          {avgPrice > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              (avg £{avgPrice.toFixed(2)}/mo)
            </span>
          )}
        </h2>

        {deals.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CardSim className="mx-auto size-12 text-muted-foreground/40 mb-4" />
              <p className="text-lg font-semibold">No SIM-only deals available</p>
              <p className="mt-2 text-muted-foreground">
                Check back shortly — feed refresh runs Sunday 03:00 UTC.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal) => {
              const badges = getOpinionatedBadges(
                {
                  ...deal,
                  features: deal.features ? JSON.parse(deal.features) : [],
                  provider: {
                    id: deal.provider.id,
                    name: deal.provider.name,
                    slug: deal.provider.slug,
                    logo: deal.provider.logo,
                    trustScore: deal.provider.trustScore,
                    reviewCount: deal.provider.reviewCount,
                  },
                },
                { cheapestInCategory: cheapest?.monthlyCost, avgPrice }
              );

              return (
                <Card
                  key={deal.id}
                  className="overflow-hidden border border-border/60 transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <ProviderLogo
                        name={deal.provider.name}
                        slug={deal.provider.slug}
                        logo={deal.provider.logo}
                        size={40}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          {deal.provider.name}
                        </p>
                        <h3 className="text-sm font-semibold leading-tight line-clamp-2">
                          {deal.name}
                        </h3>
                      </div>
                    </div>

                    {/* Big data display — most important spec for SIM-only */}
                    {deal.dataAllowance && (
                      <div className="my-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40 px-4 py-3 text-center">
                        <p className="text-3xl font-bold tracking-tight text-orange-700 dark:text-orange-300">
                          {deal.dataAllowance.toLowerCase().replace("gb", "")
                            .toUpperCase() || ""}
                          {!/unlimited/i.test(deal.dataAllowance) && (
                            <span className="text-base font-medium ml-0.5">GB</span>
                          )}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                          {deal.networkType
                            ? `of ${deal.networkType} data`
                            : "data"}
                        </p>
                      </div>
                    )}

                    {/* Price + contract */}
                    <div className="flex items-end justify-between gap-3 mb-2">
                      <div>
                        <p className="text-2xl font-bold">£{deal.monthlyCost.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">a month</p>
                        {deal.contractLength === 1 ? (
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                            🔄 30-day rolling
                          </p>
                        ) : deal.contractLength ? (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {deal.contractLength} month contract
                          </p>
                        ) : null}
                      </div>
                      <Button
                        asChild
                        size="sm"
                        className="bg-orange-600 text-white hover:bg-orange-700"
                      >
                        <Link href={`/deals/${deal.slug}`}>View deal</Link>
                      </Button>
                    </div>

                    {badges.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-border/40">
                        {badges.map((b) => (
                          <Badge
                            key={b.label}
                            variant="outline"
                            className={cn(
                              "text-[10px] px-2 py-0.5 font-medium border",
                              TONE_STYLES[b.tone]
                            )}
                          >
                            {b.emoji && <span className="mr-1">{b.emoji}</span>}
                            {b.label}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Helpful info */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h2 className="text-xl font-bold mb-6">SIM-only buying tips</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <Calendar className="size-5 text-orange-500 mb-2" />
              <h3 className="font-semibold mb-1">30-day rolling vs 12-month</h3>
              <p className="text-sm text-muted-foreground">
                Rolling 30-day deals cost £1-£3/mo more but you can leave
                anytime. 12-month locks in the lower price but ties you in.
              </p>
            </div>
            <div>
              <Globe className="size-5 text-blue-500 mb-2" />
              <h3 className="font-semibold mb-1">EU roaming after Brexit</h3>
              <p className="text-sm text-muted-foreground">
                Most UK networks now charge £1-£3/day for EU roaming.{" "}
                <Link href="/guides/mobile/best-sim-only-for-eu-travel-2026" className="text-orange-600 hover:underline font-medium">
                  See which providers still include it free →
                </Link>
              </p>
            </div>
            <div>
              <ShieldCheck className="size-5 text-emerald-500 mb-2" />
              <h3 className="font-semibold mb-1">Network coverage</h3>
              <p className="text-sm text-muted-foreground">
                Lebara/Talkmobile use Vodafone, 1pMobile/Ecotalk use EE, VOXI
                uses Vodafone. Check{" "}
                <a
                  href="https://checker.ofcom.org.uk/en-gb/mobile-coverage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:underline font-medium"
                >
                  Ofcom's coverage map
                </a>{" "}
                for your postcode.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
