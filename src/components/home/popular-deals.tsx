import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/shared/price-display";
import { getPopularDeals } from "@/lib/services/deal.service";
import { getProviderColor, getProviderInitials } from "@/lib/utils/provider-avatar";
import { cn } from "@/lib/utils";

export async function PopularDeals() {
  // Only fetch mobile deals — the only live category
  const deals = await getPopularDeals("mobile", 6);

  if (deals.length === 0) return null;

  return (
    <section className="bg-slate-50 dark:bg-slate-900/50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Popular Deals Right Now
          </h2>
          <p className="text-muted-foreground">
            Real deals from our affiliate partners, updated regularly.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal) => (
            <Card
              key={deal.id}
              className="relative border border-border/60 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              {(deal.isPromoted || deal.isBestValue) && (
                <div className="absolute -top-0 left-4">
                  <Badge
                    className={cn(
                      "rounded-t-none rounded-b-md text-white",
                      deal.isBestValue
                        ? "bg-[#38a169] hover:bg-[#38a169]"
                        : "bg-[#1a365d] hover:bg-[#1a365d]"
                    )}
                  >
                    {deal.isBestValue ? "Best Value" : "Promoted"}
                  </Badge>
                </div>
              )}
              <CardContent className="flex flex-col gap-3 sm:gap-4 p-4 pt-6 sm:p-6 sm:pt-8">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                      getProviderColor(deal.provider.name)
                    )}
                  >
                    {getProviderInitials(deal.provider.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">
                      {deal.provider.name}
                    </p>
                    <h4 className="text-sm font-semibold text-foreground truncate">
                      {deal.name}
                    </h4>
                  </div>
                </div>

                {deal.contractLength && (
                  <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800/50">
                    <p className="text-sm font-medium text-foreground">
                      {deal.contractLength}-month contract
                    </p>
                  </div>
                )}

                <div className="mt-auto flex items-end justify-between border-t pt-4">
                  <PriceDisplay
                    amount={deal.monthlyCost}
                    period="month"
                    size="md"
                  />
                  <Button
                    asChild
                    className="bg-gradient-to-r from-[#1a365d] to-[#38a169] text-white hover:from-[#2a4a7f] hover:to-[#48bb78]"
                  >
                    <Link href={`/deals/${deal.slug}`}>View deal</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" size="lg" asChild>
            <Link href="/mobile">
              View all mobile deals
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
