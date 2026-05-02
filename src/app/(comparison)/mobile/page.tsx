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
  Sparkles,
  Trophy,
  Award,
  Medal,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { LatestPhones } from "@/components/home/latest-phones";
import { scorePhoneRecency } from "@/lib/utils/phone-recency";
import { getBrandColor } from "@/config/brand-colors";

export const metadata: Metadata = {
  title: "Compare Mobile Deals - Phone Contracts & SIM Only",
  description:
    "Compare the best mobile phone deals from Vodafone, Talkmobile and Lebara. Find cheap SIM only deals and phone contracts. Real prices, real affiliate links.",
};

export const dynamic = "force-dynamic";

async function getPhoneModels() {
  const plans = await prisma.plan.findMany({
    where: {
      category: "mobile",
      imageUrl: { not: null },
      handsetModel: { not: null },
    },
    select: {
      handsetModel: true,
      imageUrl: true,
      monthlyCost: true,
      setupFee: true,
      name: true,
    },
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
      if (recency.score > existing.topRecency) {
        existing.topRecency = recency.score;
        existing.topModelLabel = recency.modelLabel;
        existing.image = p.imageUrl!;
      }
    }
  }
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

async function getLiveStats() {
  try {
    const [total, providers, cheapest, lastUpdate] = await Promise.all([
      prisma.plan.count({ where: { category: "mobile" } }),
      prisma.provider.count({
        where: { isActive: true },
      }),
      prisma.plan.aggregate({
        where: { category: "mobile" },
        _min: { monthlyCost: true },
      }),
      prisma.plan.findFirst({
        where: { category: "mobile" },
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
    ]);
    return {
      total,
      providers,
      cheapest: cheapest._min.monthlyCost ?? 4.5,
      lastUpdate: lastUpdate?.updatedAt ?? null,
    };
  } catch {
    return { total: 0, providers: 0, cheapest: 4.5, lastUpdate: null };
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

export default async function MobilePage() {
  const [phones, topDeals, stats] = await Promise.all([
    getPhoneModels(),
    getTopDeals(),
    getLiveStats(),
  ]);

  const rankStyles = [
    { chip: "from-amber-400 to-yellow-500", icon: Trophy, label: "Top pick" },
    { chip: "from-slate-300 to-slate-500", icon: Award, label: "Best value" },
    { chip: "from-orange-400 to-amber-700", icon: Medal, label: "Editor's pick" },
  ];

  return (
    <div>
      {/* Hero — cinematic gradient with animated decoration */}
      <section className="relative bg-gradient-to-br from-[#0a1628] via-[#1a365d] to-[#2a4a7f] text-white overflow-hidden">
        {/* Animated blob */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        {/* Dot grid */}
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
            <Badge className="mb-4 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white border-0 shadow-lg">
              <Sparkles className="size-3 mr-1" />
              {stats.total.toLocaleString("en-GB")} live mobile deals
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Mobile phone deals
              <span className="block mt-2 bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent">
                that don&apos;t lie about the price.
              </span>
            </h1>
            <p className="mt-5 text-lg text-blue-100/90 leading-relaxed max-w-2xl">
              Compare phone contracts and SIM-only deals from Vodafone,
              Talkmobile, Lebara and more. Real Awin-verified prices, updated
              daily.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                asChild
                className="bg-white text-[#1a365d] hover:bg-blue-50 font-bold px-8 shadow-lg hover:shadow-xl transition-all"
              >
                <Link href="/mobile/contracts">
                  <Phone className="size-5" />
                  Phone contracts
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/40 bg-white/10 backdrop-blur text-white hover:bg-white/20 font-bold px-8"
              >
                <Link href="/mobile/sim-only">
                  <CardSim className="size-5" />
                  SIM-only deals
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
                icon: TrendingDown,
                value: stats.total.toLocaleString("en-GB"),
                label: "Live deals",
                grad: "from-emerald-500 to-emerald-700",
              },
              {
                icon: Smartphone,
                value: `£${stats.cheapest.toFixed(2)}`,
                label: "Cheapest /mo",
                grad: "from-blue-500 to-blue-700",
              },
              {
                icon: ShieldCheck,
                value: stats.providers.toString(),
                label: "Verified retailers",
                grad: "from-purple-500 to-purple-700",
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

      {/* Browse categories — brand-coloured tiles */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            What are you looking for?
          </h2>
          <p className="text-muted-foreground mb-8">
            Pick the path that fits — keep your phone, get a new one, or save
            money on a refurb.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                href: "/mobile/contracts",
                icon: Smartphone,
                title: "Phone contracts",
                desc: "New phone with a monthly plan",
                grad: "from-blue-500 to-indigo-600",
                bg: "from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40",
              },
              {
                href: "/mobile/sim-only",
                icon: CardSim,
                title: "SIM only",
                desc: "Keep your phone, save on the bill",
                grad: "from-orange-500 to-amber-600",
                bg: "from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40",
              },
              {
                href: "/refurbished",
                icon: Recycle,
                title: "Refurbished",
                desc: "Like-new iPhone & Galaxy",
                grad: "from-emerald-500 to-teal-600",
                bg: "from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40",
              },
              {
                href: "/providers",
                icon: ShieldCheck,
                title: "All providers",
                desc: "Vodafone, Mozillion, Be Fibre & more",
                grad: "from-purple-500 to-fuchsia-600",
                bg: "from-purple-50 to-fuchsia-50 dark:from-purple-950/40 dark:to-fuchsia-950/40",
              },
            ].map((tile) => (
              <Link key={tile.href} href={tile.href} className="group">
                <div
                  className={`relative h-full rounded-2xl bg-gradient-to-br ${tile.bg} border border-border/50 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden`}
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
                  <span className="mt-4 inline-flex items-center text-sm font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Compare
                    <ArrowRight className="ml-1 size-4 text-foreground/70 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest flagships strip */}
      <LatestPhones />

      {/* Brand gallery */}
      {phones.length > 0 && (
        <section className="bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900/40 dark:via-slate-950 dark:to-slate-900/40">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
            <Badge className="mb-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-md">
              <Smartphone className="size-3 mr-1" />
              Browse by brand
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              Pick your manufacturer
            </h2>
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
                  <div className="rounded-2xl border border-border/60 bg-white dark:bg-slate-800/50 overflow-hidden hover:shadow-2xl hover:-translate-y-1.5 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all duration-300">
                    <div className="relative aspect-square bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-4">
                      <Image
                        src={phone.image}
                        alt={phone.brand}
                        fill
                        className="object-contain p-3 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                      />
                      {phone.topModelLabel && (
                        <Badge className="absolute top-2 left-2 bg-gradient-to-r from-[#1a365d] to-[#2a4a7f] text-white border-0 text-[10px] shadow-md">
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
                      <p className="text-lg font-extrabold bg-gradient-to-br from-[#1a365d] to-[#38a169] bg-clip-text text-transparent">
                        £{phone.cheapest.toFixed(2)}
                        <span className="text-xs font-normal text-muted-foreground ml-0.5">
                          /mo
                        </span>
                      </p>
                      <div className="mt-3 rounded-lg bg-slate-100 dark:bg-slate-700/50 py-2 text-xs font-bold text-muted-foreground group-hover:bg-gradient-to-r group-hover:from-[#1a365d] group-hover:to-[#38a169] group-hover:text-white transition-all">
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

      {/* Cheapest deals leaderboard */}
      <section className="relative bg-gradient-to-b from-white via-rose-50/20 to-white dark:from-slate-950 dark:via-rose-950/10 dark:to-slate-950 overflow-hidden">
        <div className="absolute top-1/2 -translate-y-1/2 -left-32 w-72 h-72 rounded-full bg-rose-200/40 dark:bg-rose-900/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -translate-y-1/2 -right-32 w-72 h-72 rounded-full bg-amber-200/40 dark:bg-amber-900/20 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <Badge className="mb-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white border-0 shadow-md">
                <Zap className="size-3 mr-1" />
                Cheapest right now
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold">
                Top 6 mobile deals
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Starting from £{stats.cheapest.toFixed(2)}/month — Awin
                affiliate verified.
              </p>
            </div>
            <Button
              variant="outline"
              asChild
              className="border-rose-200 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950"
            >
              <Link href="/mobile/compare">
                View all <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {topDeals.map((deal, idx) => {
              const priceWhole = Math.floor(deal.monthlyCost);
              const pricePence = Math.round(
                (deal.monthlyCost - priceWhole) * 100
              );
              const rank = idx < 3 ? rankStyles[idx] : null;
              const RankIcon = rank?.icon;
              const brand = getBrandColor(deal.provider.slug);
              const priceGrad = brand
                ? { from: brand.from, to: brand.to }
                : { from: "#1a365d", to: "#38a169" };

              return (
                <div
                  key={deal.id}
                  className={`group relative rounded-2xl bg-white dark:bg-slate-900/80 border border-border/60 ${rank ? "ring-1 ring-amber-200/50 dark:ring-amber-900/30" : ""} shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden`}
                >
                  {rank && (
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${rank.chip}`}
                    />
                  )}
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                      <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-white font-extrabold text-base shadow-md ${
                          rank
                            ? `bg-gradient-to-br ${rank.chip}`
                            : "bg-gradient-to-br from-slate-400 to-slate-600"
                        }`}
                      >
                        {RankIcon ? (
                          <RankIcon className="size-5" />
                        ) : (
                          <span>#{idx + 1}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 sm:w-[260px] sm:shrink-0 min-w-0">
                        {deal.imageUrl ? (
                          <div className="relative size-14 shrink-0 rounded-lg bg-slate-50 dark:bg-slate-800/50 ring-1 ring-border/50">
                            <Image
                              src={deal.imageUrl}
                              alt={deal.name}
                              fill
                              className="object-contain p-1.5 group-hover:scale-110 transition-transform"
                              sizes="56px"
                            />
                          </div>
                        ) : (
                          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#1a365d] text-sm font-bold text-white">
                            {deal.provider.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {deal.provider.name}
                          </p>
                          <h3 className="text-sm font-bold leading-tight line-clamp-2 mt-0.5">
                            {deal.name.replace(/ - £[\d.]+\/mo.*/, "")}
                          </h3>
                        </div>
                      </div>

                      {deal.dataAllowance && (
                        <div className="text-center sm:flex-1">
                          <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">
                            {deal.dataAllowance.replace(/GB/i, "")}
                            <span className="text-sm font-bold ml-0.5">GB</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground font-medium">
                            data
                          </p>
                        </div>
                      )}

                      <div className="text-center sm:text-right sm:shrink-0 sm:min-w-[140px]">
                        <div
                          className="rounded-xl px-4 py-2 text-white shadow-md inline-block sm:w-full"
                          style={{
                            background: `linear-gradient(135deg, ${priceGrad.from}, ${priceGrad.to})`,
                          }}
                        >
                          <div className="flex items-baseline gap-0.5 justify-center sm:justify-end">
                            <span className="text-2xl font-extrabold tabular-nums">
                              £{priceWhole}
                            </span>
                            {pricePence > 0 && (
                              <span className="text-2xl font-extrabold tabular-nums">
                                .{pricePence.toString().padStart(2, "0")}
                              </span>
                            )}
                            <span className="text-xs opacity-90 ml-0.5">
                              /mo
                            </span>
                          </div>
                          {deal.contractLength && deal.contractLength > 1 && (
                            <p className="text-[10px] opacity-85 font-medium">
                              {deal.contractLength}-month
                            </p>
                          )}
                        </div>
                      </div>

                      <Button
                        asChild
                        className="bg-gradient-to-r from-[#1a365d] to-[#38a169] hover:from-[#2a4a7f] hover:to-[#48bb78] text-white border-0 font-semibold px-6 sm:shrink-0 shadow-md"
                      >
                        <Link href={`/deals/${deal.slug}`}>
                          View deal
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
