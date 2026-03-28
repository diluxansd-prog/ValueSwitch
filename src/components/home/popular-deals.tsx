import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Signal, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProviderLogo } from "@/components/shared/provider-logo";
import { getPopularDeals } from "@/lib/services/deal.service";

export async function PopularDeals() {
  const deals = await getPopularDeals("mobile", 6);
  if (deals.length === 0) return null;

  return (
    <section className="bg-slate-50 dark:bg-slate-900/50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Popular Deals
            </h2>
            <p className="mt-1 text-muted-foreground">
              Real deals from our affiliate partners, updated regularly.
            </p>
          </div>
          <Button variant="outline" asChild className="shrink-0">
            <Link href="/mobile/compare">
              View all deals
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="space-y-3">
          {deals.map((deal) => {
            const priceWhole = Math.floor(deal.monthlyCost);
            const pricePence = Math.round((deal.monthlyCost - priceWhole) * 100);
            const cleanName = deal.name.replace(/ - £[\d.]+\/mo.*/, "");

            return (
              <Card
                key={deal.id}
                className="border border-border/60 transition-all hover:shadow-md"
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                    {/* Provider + image */}
                    <div className="flex items-center gap-3 sm:w-[220px] sm:shrink-0">
                      {deal.imageUrl ? (
                        <div className="relative size-12 shrink-0 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                          <Image src={deal.imageUrl} alt={deal.name} fill className="object-contain p-1" sizes="48px" />
                        </div>
                      ) : (
                        <ProviderLogo name={deal.provider.name} logo={deal.provider.logo} size={42} />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">{deal.provider.name}</p>
                        <h3 className="text-sm font-semibold leading-tight line-clamp-2">{cleanName}</h3>
                      </div>
                    </div>

                    {/* Data */}
                    {deal.dataAllowance && (
                      <div className="text-center sm:flex-1">
                        <p className="text-2xl font-bold">
                          {deal.dataAllowance.replace(/GB/i, "")}
                          <span className="text-sm font-medium text-muted-foreground ml-0.5">GB</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {deal.networkType ? `of ${deal.networkType} data` : "data"}
                        </p>
                      </div>
                    )}

                    {/* Price */}
                    <div className="text-center sm:text-right sm:shrink-0">
                      <div className="flex items-baseline gap-0.5 sm:justify-end">
                        <span className="text-xl font-bold">£{priceWhole}</span>
                        {pricePence > 0 && <span className="text-xl font-bold">.{pricePence.toString().padStart(2, "0")}</span>}
                        <span className="text-sm text-muted-foreground ml-0.5">a month</span>
                      </div>
                      {deal.contractLength && deal.contractLength > 1 && (
                        <p className="text-[11px] text-muted-foreground">{deal.contractLength} month contract</p>
                      )}
                    </div>

                    {/* CTA */}
                    <Button asChild className="bg-[#1a365d] text-white hover:bg-[#2a4a7f] font-semibold px-6 sm:shrink-0">
                      <Link href={`/deals/${deal.slug}`}>View deal</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
