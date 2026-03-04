"use client";

import Link from "next/link";
import { Zap, Wifi, Smartphone, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PriceDisplay } from "@/components/shared/price-display";

interface Deal {
  id: string;
  provider: string;
  planName: string;
  keySpec: string;
  monthlyPrice: number;
  promoted: boolean;
}

const energyDeals: Deal[] = [
  {
    id: "e1",
    provider: "Octopus Energy",
    planName: "Flexible Octopus",
    keySpec: "Variable tariff",
    monthlyPrice: 89.0,
    promoted: true,
  },
  {
    id: "e2",
    provider: "British Gas",
    planName: "Fixed Price 2026",
    keySpec: "12-month fix",
    monthlyPrice: 95.5,
    promoted: false,
  },
  {
    id: "e3",
    provider: "EDF Energy",
    planName: "Simply Fixed",
    keySpec: "24-month fix",
    monthlyPrice: 92.0,
    promoted: false,
  },
];

const broadbandDeals: Deal[] = [
  {
    id: "b1",
    provider: "BT",
    planName: "Fibre 2",
    keySpec: "73 Mbps",
    monthlyPrice: 29.99,
    promoted: true,
  },
  {
    id: "b2",
    provider: "Sky",
    planName: "Superfast 80",
    keySpec: "80 Mbps",
    monthlyPrice: 28.0,
    promoted: false,
  },
  {
    id: "b3",
    provider: "Virgin Media",
    planName: "M250",
    keySpec: "264 Mbps",
    monthlyPrice: 33.0,
    promoted: false,
  },
];

const mobileDeals: Deal[] = [
  {
    id: "m1",
    provider: "EE",
    planName: "SIM Only 25GB",
    keySpec: "25GB data",
    monthlyPrice: 16.0,
    promoted: true,
  },
  {
    id: "m2",
    provider: "Three",
    planName: "Unlimited Data",
    keySpec: "Unlimited",
    monthlyPrice: 22.0,
    promoted: false,
  },
  {
    id: "m3",
    provider: "Vodafone",
    planName: "Xtra Plan 100GB",
    keySpec: "100GB data",
    monthlyPrice: 20.0,
    promoted: false,
  },
];

const tabConfig = [
  { value: "energy", label: "Energy", icon: Zap, deals: energyDeals },
  { value: "broadband", label: "Broadband", icon: Wifi, deals: broadbandDeals },
  { value: "mobile", label: "Mobile", icon: Smartphone, deals: mobileDeals },
];

function DealCard({ deal, category }: { deal: Deal; category: string }) {
  return (
    <Card className="relative border border-border/60 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      {deal.promoted && (
        <div className="absolute -top-0 left-4">
          <Badge className="rounded-t-none rounded-b-md bg-[#38a169] text-white hover:bg-[#38a169]">
            Promoted
          </Badge>
        </div>
      )}
      <CardContent className="flex flex-col gap-3 sm:gap-4 p-4 pt-6 sm:p-6 sm:pt-8">
        {/* Provider & Plan */}
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {deal.provider}
          </p>
          <h4 className="text-base font-semibold text-foreground">
            {deal.planName}
          </h4>
        </div>

        {/* Key Spec */}
        <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/50">
          <p className="text-sm font-medium text-foreground">{deal.keySpec}</p>
        </div>

        {/* Price */}
        <PriceDisplay amount={deal.monthlyPrice} period="month" size="md" />

        {/* CTA */}
        <Button
          asChild
          className="w-full bg-gradient-to-r from-[#1a365d] to-[#38a169] text-white hover:from-[#2a4a7f] hover:to-[#48bb78]"
        >
          <Link href={`/${category}`}>View deal</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function PopularDeals() {
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
                {tab.deals.map((deal) => (
                  <DealCard key={deal.id} deal={deal} category={tab.value} />
                ))}
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
