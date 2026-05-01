import type { Metadata } from "next";
import Link from "next/link";
import {
  Wifi,
  ShieldCheck,
  TrendingDown,
  Clock,
  Zap,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProviderLogo } from "@/components/shared/provider-logo";
import { prisma } from "@/lib/prisma";

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

function speedTier(mbps?: number | null): {
  label: string;
  color: string;
  badge: string;
} {
  if (!mbps) return { label: "Standard", color: "text-slate-600", badge: "bg-slate-100" };
  if (mbps >= 900)
    return {
      label: "Gigabit",
      color: "text-emerald-700",
      badge: "bg-emerald-100 dark:bg-emerald-900/40",
    };
  if (mbps >= 500)
    return {
      label: "Ultrafast",
      color: "text-blue-700",
      badge: "bg-blue-100 dark:bg-blue-900/40",
    };
  if (mbps >= 100)
    return {
      label: "Superfast",
      color: "text-purple-700",
      badge: "bg-purple-100 dark:bg-purple-900/40",
    };
  return { label: "Standard", color: "text-slate-700", badge: "bg-slate-100" };
}

export default async function BroadbandPage() {
  const deals = await getBroadbandDeals();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a365d] via-[#1e3a5f] to-[#2a4a7f] text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="max-w-2xl">
            <Badge className="mb-3 border-white/20 bg-white/10 text-white">
              <Wifi className="size-3.5 mr-1.5" />
              Full-fibre broadband
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Compare UK fibre broadband deals
            </h1>
            <p className="mt-4 text-lg text-blue-100 leading-relaxed">
              Gigabit-ready full-fibre packages from Be Fibre and other UK providers.
              Real monthly prices, no marketing fluff.
            </p>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
              <span className="text-muted-foreground">Real prices</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-yellow-500 shrink-0" />
              <span className="text-muted-foreground">Gigabit ready</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="size-4 text-blue-600 shrink-0" />
              <span className="text-muted-foreground">Updated daily</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-purple-600 shrink-0" />
              <span className="text-muted-foreground">12 + 24 month</span>
            </div>
          </div>
        </div>
      </section>

      {/* Deals list */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <h2 className="text-2xl font-bold tracking-tight">
            {deals.length} fibre deal{deals.length !== 1 ? "s" : ""}
            {deals.length > 0 && (
              <span className="ml-2 text-base font-normal text-muted-foreground">
                from £{Math.min(...deals.map((d) => d.monthlyCost)).toFixed(2)}/mo
              </span>
            )}
          </h2>

          {deals.length === 0 ? (
            <Card className="mt-6">
              <CardContent className="p-12 text-center">
                <Wifi className="mx-auto size-12 text-muted-foreground/40 mb-4" />
                <p className="text-lg font-semibold">No fibre deals yet</p>
                <p className="mt-2 text-muted-foreground">
                  We&apos;re onboarding broadband partners — come back soon.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {deals.map((deal) => {
                const tier = speedTier(deal.downloadSpeed);
                return (
                  <Card
                    key={deal.id}
                    className="overflow-hidden border border-border/60 transition-all hover:shadow-md"
                  >
                    <div className={`${tier.badge} px-5 py-3 flex items-center justify-between`}>
                      <span className={`text-xs font-semibold uppercase tracking-wider ${tier.color}`}>
                        {tier.label}
                      </span>
                      {deal.contractLength && (
                        <span className="text-xs text-muted-foreground">
                          {deal.contractLength} month
                        </span>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <ProviderLogo
                          name={deal.provider.name}
                          logo={deal.provider.logo}
                          size={40}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-muted-foreground">
                            {deal.provider.name}
                          </p>
                          <h3 className="text-base font-semibold leading-tight">
                            {deal.name}
                          </h3>
                        </div>
                      </div>

                      {deal.downloadSpeed && (
                        <div className="mb-3 flex items-baseline gap-1">
                          <span className="text-3xl font-bold tracking-tight">
                            {deal.downloadSpeed}
                          </span>
                          <span className="text-sm font-medium text-muted-foreground">
                            Mbps
                          </span>
                        </div>
                      )}

                      <div className="mb-4 flex items-baseline gap-1">
                        <span className="text-2xl font-bold">
                          £{deal.monthlyCost.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground">a month</span>
                      </div>

                      {deal.description && (
                        <p className="mb-4 text-xs text-muted-foreground line-clamp-2">
                          {deal.description}
                        </p>
                      )}

                      <Button
                        asChild
                        className="w-full bg-[#1a365d] text-white hover:bg-[#2a4a7f]"
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

      {/* Helpful info */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h2 className="text-xl font-bold mb-6">What to look for in a fibre deal</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <Zap className="size-5 text-yellow-500 mb-2" />
              <h3 className="font-semibold mb-1">Speed (Mbps)</h3>
              <p className="text-sm text-muted-foreground">
                For 1-2 person households, 100 Mbps is plenty. For families with
                streaming + gaming, look for 500 Mbps+. Gigabit (1000 Mbps) is
                future-proofing.
              </p>
            </div>
            <div>
              <Clock className="size-5 text-purple-500 mb-2" />
              <h3 className="font-semibold mb-1">Contract length</h3>
              <p className="text-sm text-muted-foreground">
                12-month contracts cost a few pounds more per month but give
                flexibility. 24-month locks in a lower price but watch for
                price-rise clauses.
              </p>
            </div>
            <div>
              <ShieldCheck className="size-5 text-emerald-500 mb-2" />
              <h3 className="font-semibold mb-1">Setup fees</h3>
              <p className="text-sm text-muted-foreground">
                Most full-fibre providers offer free installation and a free
                router. Check the small print for delivery and activation fees.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
