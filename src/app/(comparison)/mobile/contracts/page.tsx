import type { Metadata } from "next";
import Link from "next/link";
import {
  Smartphone,
  ShieldCheck,
  ArrowRight,
  Signal,
  Filter,
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
  title: "Mobile Phone Contracts UK 2026 — Cheapest Pay-Monthly Deals",
  description:
    "Compare every UK mobile phone contract — iPhone, Samsung, Google Pixel and more from Vodafone, Fonehouse, Mozillion and 8 other retailers. Live prices, real deals, updated weekly.",
};

export const dynamic = "force-dynamic";

async function getContracts() {
  try {
    return await prisma.plan.findMany({
      where: {
        category: "mobile",
        subcategory: "contract",
      },
      include: { provider: true },
      orderBy: { monthlyCost: "asc" },
      take: 60,
    });
  } catch {
    return [];
  }
}

async function getBrandStats() {
  try {
    const rows = await prisma.plan.groupBy({
      by: ["handsetModel"],
      where: { category: "mobile", subcategory: "contract", handsetModel: { not: null } },
      _count: { _all: true },
      _min: { monthlyCost: true },
    });
    return rows
      .filter((r) => r.handsetModel && r.handsetModel !== "Other")
      .sort((a, b) => b._count._all - a._count._all);
  } catch {
    return [];
  }
}

export default async function MobileContractsPage() {
  const [deals, brands] = await Promise.all([getContracts(), getBrandStats()]);
  const cheapest = deals[0];
  const avgPrice =
    deals.length > 0
      ? deals.reduce((s, d) => s + d.monthlyCost, 0) / deals.length
      : 0;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f1f3d] via-[#1a365d] to-[#1e2a47] text-white">
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <div
            className="absolute -top-32 -right-20 w-[500px] h-[500px] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(66,153,225,0.5), transparent 60%)",
            }}
          />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <Badge className="mb-3 border-white/20 bg-white/10 text-white">
            <Smartphone className="size-3.5 mr-1.5" />
            {deals.length} live contracts · {brands.length} brands
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Mobile phone contracts
          </h1>
          <p className="mt-4 text-lg text-blue-100/80 leading-relaxed max-w-2xl">
            Compare every pay-monthly contract from our 9 retailers in one
            place. Latest iPhone 17, Galaxy S25 Ultra, Pixel 9, and budget
            phones from Honor, Motorola and Doro.
          </p>
          {cheapest && (
            <p className="mt-3 text-sm text-blue-100/70">
              Cheapest right now:{" "}
              <strong className="text-white">
                £{cheapest.monthlyCost.toFixed(2)}/mo
              </strong>{" "}
              — {cheapest.name.split("|")[0]?.trim()}
            </p>
          )}
        </div>
      </section>

      {/* Brand quick-jump tiles */}
      {brands.length > 0 && (
        <section className="border-b bg-muted/20">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="size-4 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Jump to a brand
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {brands.slice(0, 12).map((b) => (
                <Link
                  key={b.handsetModel}
                  href={`/best-deals/${b.handsetModel!.toLowerCase()}`}
                  className="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-background hover:bg-accent px-3 py-1.5 text-sm font-medium transition-all hover:scale-[1.03] hover:shadow-sm"
                >
                  <span>{b.handsetModel}</span>
                  <span className="text-xs text-muted-foreground">
                    {b._count._all} deals
                  </span>
                  {b._min.monthlyCost && (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      from £{b._min.monthlyCost.toFixed(0)}
                    </span>
                  )}
                  <ArrowRight className="size-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Deals grid */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Top {deals.length} contracts
            {avgPrice > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                (avg £{avgPrice.toFixed(2)}/mo)
              </span>
            )}
          </h2>
          <Link
            href="/mobile/compare"
            className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Advanced filters →
          </Link>
        </div>

        {deals.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Smartphone className="mx-auto size-12 text-muted-foreground/40 mb-4" />
              <p className="text-lg font-semibold">No contracts available right now</p>
              <p className="mt-2 text-muted-foreground">Check back shortly — feed refresh runs Sunday 03:00 UTC.</p>
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
                {
                  cheapestInCategory: cheapest?.monthlyCost,
                  avgPrice,
                }
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

                    {/* Specs row */}
                    <div className="grid grid-cols-3 gap-2 my-4 text-center border-y border-border/40 py-3">
                      {deal.dataAllowance && (
                        <div>
                          <p className="text-sm font-bold">{deal.dataAllowance}</p>
                          <p className="text-[10px] text-muted-foreground">data</p>
                        </div>
                      )}
                      {deal.networkType && (
                        <div>
                          <p className="text-sm font-bold flex items-center justify-center gap-1">
                            <Signal className="size-3" />
                            {deal.networkType}
                          </p>
                          <p className="text-[10px] text-muted-foreground">network</p>
                        </div>
                      )}
                      {deal.contractLength != null && deal.contractLength > 0 && (
                        <div>
                          <p className="text-sm font-bold">{deal.contractLength}m</p>
                          <p className="text-[10px] text-muted-foreground">contract</p>
                        </div>
                      )}
                    </div>

                    {/* Price + CTA */}
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-2xl font-bold">£{deal.monthlyCost.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">a month</p>
                        {deal.setupFee > 0 && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            £{deal.setupFee.toFixed(2)} upfront
                          </p>
                        )}
                      </div>
                      <Button
                        asChild
                        size="sm"
                        className="bg-[#1a365d] text-white hover:bg-[#2a4a7f]"
                      >
                        <Link href={`/deals/${deal.slug}`}>View deal</Link>
                      </Button>
                    </div>

                    {/* Opinionated badges */}
                    {badges.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-border/40">
                        {badges.map((b) => (
                          <Badge
                            key={b.label}
                            variant="outline"
                            className={cn("text-[10px] px-2 py-0.5 font-medium border", TONE_STYLES[b.tone])}
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

      {/* Trust footer */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 text-emerald-600" />
            <span>
              All contracts pulled live from Awin partner feeds — never invented prices.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
