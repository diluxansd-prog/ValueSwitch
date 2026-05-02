import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Smartphone,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Clock,
  CardSim,
  Phone,
  Recycle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { LatestPhones } from "@/components/home/latest-phones";
import { scorePhoneRecency } from "@/lib/utils/phone-recency";

export const metadata: Metadata = {
  title: "Compare Mobile Deals - Phone Contracts & SIM Only",
  description: "Compare the best mobile phone deals from Vodafone, Talkmobile and Lebara. Find cheap SIM only deals and phone contracts. Real prices, real affiliate links.",
};

export const dynamic = "force-dynamic";

async function getPhoneModels() {
  const plans = await prisma.plan.findMany({
    where: { category: "mobile", imageUrl: { not: null }, handsetModel: { not: null } },
    select: { handsetModel: true, imageUrl: true, monthlyCost: true, setupFee: true, name: true },
    orderBy: { monthlyCost: "asc" },
  });

  const byBrand = new Map<
    string,
    {
      brand: string;
      image: string;
      cheapest: number;
      setupFee: number;
      count: number;
      sampleName: string;
      // Highest recency score across all plans for this brand — drives "newest-first" ordering.
      topRecency: number;
      topModelLabel: string;
    }
  >();
  for (const p of plans) {
    const brand = p.handsetModel || "Unknown";
    if (brand === "Unknown" || brand === "Vodafone") continue;
    const recency = scorePhoneRecency(p.name);
    const existing = byBrand.get(brand);
    if (!existing) {
      const modelMatch = p.name.match(/^(.+?)(?:\s*(?:Dual SIM|5G)?\s*\()/);
      const sampleName = modelMatch ? modelMatch[1].trim() : brand;
      byBrand.set(brand, {
        brand,
        image: p.imageUrl!,
        cheapest: p.monthlyCost,
        setupFee: p.setupFee,
        count: 1,
        sampleName,
        topRecency: recency.score,
        topModelLabel: recency.modelLabel,
      });
    } else {
      existing.count++;
      // If we found a more recent model in this brand, swap the headline image to it
      if (recency.score > existing.topRecency) {
        existing.topRecency = recency.score;
        existing.topModelLabel = recency.modelLabel;
        existing.image = p.imageUrl!;
      }
    }
  }
  // Newest-flagship-first → then catalogue size as tiebreaker
  return [...byBrand.values()].sort((a, b) => {
    if (a.topRecency !== b.topRecency) return b.topRecency - a.topRecency;
    return b.count - a.count;
  });
}

async function getTopDeals() {
  return prisma.plan.findMany({
    where: { category: "mobile" },
    include: { provider: true },
    orderBy: { monthlyCost: "asc" },
    take: 6,
  });
}

export default async function MobilePage() {
  const [phones, topDeals] = await Promise.all([getPhoneModels(), getTopDeals()]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a365d] via-[#1e3a5f] to-[#2a4a7f] text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Mobile phone deals
            </h1>
            <p className="mt-4 text-lg text-blue-100 leading-relaxed">
              Compare phone contracts and SIM only deals from Vodafone, Talkmobile and Lebara.
              Real prices, verified by Awin.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button size="lg" asChild className="bg-white text-[#1a365d] hover:bg-blue-50 font-semibold px-8">
                <Link href="/mobile/compare">
                  <Phone className="size-5" />
                  Phone Contracts
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10 font-semibold px-8">
                <Link href="/mobile/compare?subcategory=sim-only">
                  <CardSim className="size-5" />
                  SIM Only Deals
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 px-4 py-5 sm:px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-5 text-[#38a169]" />
            <span>Verified affiliate prices</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingDown className="size-5 text-[#38a169]" />
            <span>106 real deals</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-5 text-[#38a169]" />
            <span>Updated daily from Awin</span>
          </div>
        </div>
      </section>

      {/* Latest flagships strip — newest models first */}
      <LatestPhones />

      {/* Brand Gallery — newest-flagship-bearing brands first */}
      {phones.length > 0 && (
        <section className="bg-background">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
            <h2 className="text-2xl font-bold mb-2">Browse by brand</h2>
            <p className="text-sm text-muted-foreground mb-8">
              Each tile shows the latest model we have in stock for that brand.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {phones.slice(0, 10).map((phone) => (
                <Link
                  key={phone.brand}
                  href={`/mobile/compare?brand=${encodeURIComponent(phone.brand)}`}
                  className="group"
                >
                  <div className="rounded-2xl border border-border/60 bg-white dark:bg-slate-800/50 overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                    <div className="relative aspect-square bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-4">
                      <Image
                        src={phone.image}
                        alt={phone.brand}
                        fill
                        className="object-contain p-3 group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                      />
                      {phone.topModelLabel && (
                        <Badge className="absolute top-2 left-2 bg-[#1a365d] text-white border-0 text-[10px]">
                          {phone.topModelLabel.split(" ").slice(0, 2).join(" ")}
                        </Badge>
                      )}
                    </div>
                    <div className="p-4 text-center border-t border-border/40">
                      <p className="text-base font-bold">{phone.brand}</p>
                      {phone.topModelLabel && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                          Latest: {phone.topModelLabel}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {phone.setupFee === 0 ? "No upfront cost from" : "From"}
                      </p>
                      <p className="text-lg font-bold text-[#1a365d] dark:text-[#48bb78]">
                        £{phone.cheapest.toFixed(2)}
                        <span className="text-xs font-normal text-muted-foreground"> /month</span>
                      </p>
                      <div className="mt-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 py-2 text-xs font-semibold text-muted-foreground group-hover:bg-[#1a365d] group-hover:text-white transition-colors">
                        See all {phone.count} deals
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top SIM Only Deals */}
      <section className="bg-slate-50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Cheapest Deals</h2>
              <p className="text-sm text-muted-foreground mt-1">Starting from £4.50/month</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/mobile/compare">
                View all <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {topDeals.map((deal) => {
              const priceWhole = Math.floor(deal.monthlyCost);
              const pricePence = Math.round((deal.monthlyCost - priceWhole) * 100);
              return (
                <Card key={deal.id} className="border border-border/60 hover:shadow-md transition-all">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                      <div className="flex items-center gap-3 sm:w-[200px] sm:shrink-0">
                        {deal.imageUrl ? (
                          <div className="relative size-12 shrink-0 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <Image src={deal.imageUrl} alt={deal.name} fill className="object-contain p-1" sizes="48px" />
                          </div>
                        ) : (
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#1a365d] text-sm font-bold text-white">
                            {deal.provider.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-muted-foreground">{deal.provider.name}</p>
                          <h3 className="text-sm font-semibold leading-tight line-clamp-2">{deal.name.replace(/ - £[\d.]+\/mo.*/, "")}</h3>
                        </div>
                      </div>

                      {deal.dataAllowance && (
                        <div className="text-center sm:flex-1">
                          <p className="text-2xl font-bold">
                            {deal.dataAllowance.replace(/GB/i, "")}
                            <span className="text-sm font-medium text-muted-foreground ml-0.5">GB</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground">data</p>
                        </div>
                      )}

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

      {/* Browse Categories */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <h2 className="text-2xl font-bold mb-8">Explore our products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/mobile/compare?subcategory=contracts">
              <Card className="group hover:shadow-lg hover:-translate-y-0.5 transition-all h-full">
                <CardContent className="p-6">
                  <Smartphone className="size-8 text-[#1a365d] mb-3" />
                  <h3 className="font-bold text-lg">Phone contracts</h3>
                  <p className="text-sm text-muted-foreground mt-1">New phone with a monthly plan</p>
                  <span className="mt-4 flex items-center text-sm font-semibold text-[#1a365d] group-hover:underline">
                    Compare <ArrowRight className="ml-1 size-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/mobile/compare?subcategory=sim-only">
              <Card className="group hover:shadow-lg hover:-translate-y-0.5 transition-all h-full">
                <CardContent className="p-6">
                  <CardSim className="size-8 text-[#1a365d] mb-3" />
                  <h3 className="font-bold text-lg">SIM only</h3>
                  <p className="text-sm text-muted-foreground mt-1">Keep your phone, save on your bill</p>
                  <span className="mt-4 flex items-center text-sm font-semibold text-[#1a365d] group-hover:underline">
                    Compare <ArrowRight className="ml-1 size-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/refurbished">
              <Card className="group hover:shadow-lg hover:-translate-y-0.5 transition-all h-full">
                <CardContent className="p-6">
                  <Recycle className="size-8 text-emerald-600 mb-3" />
                  <h3 className="font-bold text-lg">Refurbished</h3>
                  <p className="text-sm text-muted-foreground mt-1">Like-new iPhone &amp; Galaxy from Mozillion</p>
                  <span className="mt-4 flex items-center text-sm font-semibold text-emerald-700 group-hover:underline">
                    Browse <ArrowRight className="ml-1 size-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/providers">
              <Card className="group hover:shadow-lg hover:-translate-y-0.5 transition-all h-full">
                <CardContent className="p-6">
                  <ShieldCheck className="size-8 text-[#1a365d] mb-3" />
                  <h3 className="font-bold text-lg">All providers</h3>
                  <p className="text-sm text-muted-foreground mt-1">Vodafone, Mozillion, Be Fibre &amp; more</p>
                  <span className="mt-4 flex items-center text-sm font-semibold text-[#1a365d] group-hover:underline">
                    View <ArrowRight className="ml-1 size-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
