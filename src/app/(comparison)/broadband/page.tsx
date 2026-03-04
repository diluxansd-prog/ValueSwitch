import type { Metadata } from "next";
import Link from "next/link";
import {
  Wifi,
  ArrowRight,
  Download,
  Upload,
  Tv,
  ShieldCheck,
  TrendingDown,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCategoryBySlug } from "@/config/categories";
import { getPopularDeals } from "@/lib/services/deal.service";
import { formatPrice } from "@/lib/constants";
import { BroadbandPostcodeSection } from "./broadband-postcode-section";

export const metadata: Metadata = {
  title: "Compare Broadband Deals",
  description:
    "Compare broadband deals from the UK's top providers. Find the fastest broadband at the best price and switch today.",
};

export default async function BroadbandPage() {
  const category = getCategoryBySlug("broadband")!;
  const deals = await getPopularDeals("broadband", 6);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)",
            }}
          />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <Wifi className="size-4" />
              Average savings of {category.averageSavings}/year
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {category.heroTitle}
            </h1>
            <p className="mb-8 max-w-2xl text-lg leading-relaxed text-white/90">
              {category.heroDescription}
            </p>
            <BroadbandPostcodeSection />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0 60V30C240 10 480 0 720 10C960 20 1200 40 1440 30V60H0Z"
              className="fill-background"
            />
          </svg>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 px-4 py-6 sm:px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-5 text-[#38a169]" />
            <span>Ofcom Approved</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingDown className="size-5 text-[#38a169]" />
            <span>Find the fastest deals near you</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-5 text-[#38a169]" />
            <span>Hassle-free switching</span>
          </div>
        </div>
      </section>

      {/* Popular Broadband Deals */}
      <section className="bg-slate-50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground">
              Popular Broadband Deals
            </h2>
            <p className="text-muted-foreground">
              Today&apos;s best broadband packages, updated daily.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal: any) => (
              <Card
                key={deal.id}
                className="group relative border border-border/60 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                {(deal.isPromoted || deal.isBestValue) && (
                  <div className="absolute -top-0 left-4">
                    <Badge
                      className={`rounded-t-none rounded-b-md text-white hover:text-white ${
                        deal.isBestValue
                          ? "bg-[#38a169] hover:bg-[#38a169]"
                          : "bg-[#1a365d] hover:bg-[#1a365d]"
                      }`}
                    >
                      {deal.isBestValue ? "Best Value" : "Promoted"}
                    </Badge>
                  </div>
                )}
                <CardContent className="flex flex-col gap-4 p-6 pt-8">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {deal.provider.name}
                    </p>
                    <h3 className="text-base font-semibold text-foreground">
                      {deal.name}
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {deal.downloadSpeed !== null && (
                      <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800/50">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          <Download className="mb-0.5 inline size-3" /> Down
                        </p>
                        <p className="text-xs font-semibold">
                          {deal.downloadSpeed} Mbps
                        </p>
                      </div>
                    )}
                    {deal.uploadSpeed !== null && (
                      <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800/50">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          <Upload className="mb-0.5 inline size-3" /> Up
                        </p>
                        <p className="text-xs font-semibold">
                          {deal.uploadSpeed} Mbps
                        </p>
                      </div>
                    )}
                    <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800/50">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Data
                      </p>
                      <p className="text-xs font-semibold">
                        {deal.dataLimit || "Unlimited"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {deal.includesTV && (
                      <Badge
                        variant="outline"
                        className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400"
                      >
                        <Tv className="size-3" />
                        Includes TV
                      </Badge>
                    )}
                    {deal.contractLength && (
                      <Badge variant="secondary">
                        {deal.contractLength} month contract
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-end justify-between border-t pt-4">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-medium text-muted-foreground">
                          £
                        </span>
                        <span className="text-2xl font-bold">
                          {deal.monthlyCost.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /mo
                        </span>
                      </div>
                      {deal.annualCost !== null && (
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(deal.annualCost)}/year
                        </p>
                      )}
                    </div>
                    <Button
                      asChild
                      className="bg-gradient-to-r from-[#1a365d] to-[#38a169] text-white hover:from-[#2a4a7f] hover:to-[#48bb78]"
                    >
                      <Link href={`/deal/${deal.slug}`}>View deal</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/broadband/compare">
                View all broadband deals
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Subcategory Links */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground">
              Browse Broadband Categories
            </h2>
            <p className="text-muted-foreground">
              Find the right broadband package for your home.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {category.subcategories.map((sub) => (
              <Link
                key={sub.slug}
                href={`/broadband/compare?subcategory=${sub.slug}`}
              >
                <Card className="group h-full border border-border/60 transition-all duration-200 hover:border-blue-500/30 hover:shadow-md hover:-translate-y-0.5">
                  <CardContent className="flex flex-col gap-3 p-6">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                      <Wifi className="size-5 text-blue-500" />
                    </div>
                    <h3 className="font-semibold text-foreground group-hover:text-blue-600">
                      {sub.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {sub.description}
                    </p>
                    <span className="mt-auto flex items-center text-sm font-medium text-blue-600">
                      Compare now
                      <ArrowRight className="ml-1 size-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
