import Link from "next/link";
import { Zap, Wifi, Smartphone, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PriceDisplay } from "@/components/shared/price-display";
import { getPopularDeals } from "@/lib/services/deal.service";
import { cn } from "@/lib/utils";

const providerColors = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-rose-500",
  "bg-cyan-500",
];

const tabConfig = [
  { value: "energy", label: "Energy", icon: Zap },
  { value: "broadband", label: "Broadband", icon: Wifi },
  { value: "mobile", label: "Mobile", icon: Smartphone },
];

export async function PopularDeals() {
  const [energyDeals, broadbandDeals, mobileDeals] = await Promise.all([
    getPopularDeals("energy", 3),
    getPopularDeals("broadband", 3),
    getPopularDeals("mobile", 3),
  ]);

  const dealsByCategory: Record<string, typeof energyDeals> = {
    energy: energyDeals,
    broadband: broadbandDeals,
    mobile: mobileDeals,
  };

  return (
    <section className="bg-slate-50 dark:bg-slate-900/50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Popular Deals Right Now
          </h2>
          <p className="text-muted-foreground">
            Hand-picked deals from our top providers, updated daily.
          </p>
        </div>

        <Tabs defaultValue="energy" className="w-full">
          <div className="mb-8 flex justify-center">
            <TabsList className="h-auto p-1">
              {tabConfig.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="gap-1.5 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
                >
                  <tab.icon className="size-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {tabConfig.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {dealsByCategory[tab.value]?.map((deal) => {
                  const colorIndex =
                    deal.provider.name
                      .split("")
                      .reduce((acc, c) => acc + c.charCodeAt(0), 0) % 6;
                  const initials = deal.provider.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
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
                              providerColors[colorIndex]
                            )}
                          >
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              {deal.provider.name}
                            </p>
                            <h4 className="text-base font-semibold text-foreground">
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
                  );
                })}
              </div>
              <div className="mt-8 text-center">
                <Button variant="outline" size="lg" asChild>
                  <Link href={`/${tab.value}`}>
                    View all {tab.label.toLowerCase()} deals
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
