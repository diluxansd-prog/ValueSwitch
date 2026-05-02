import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Recycle,
  ShieldCheck,
  Leaf,
  Wallet,
  Sparkles,
  Award,
  ArrowRight,
  Flame,
  TreePine,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import {
  sortByRecencyThenPrice,
  scorePhoneRecency,
} from "@/lib/utils/phone-recency";

export const metadata: Metadata = {
  title: "Refurbished Phones — iPhone, Samsung & Pixel from £99",
  description:
    "Compare refurbished iPhone, Samsung Galaxy and Google Pixel deals from Mozillion and other certified UK sellers. Save up to 50% vs new — same phone, lower price.",
};

export const dynamic = "force-dynamic";

interface PlanRow {
  id: string;
  name: string;
  slug: string;
  monthlyCost: number;
  setupFee: number;
  imageUrl: string | null;
  affiliateUrl: string | null;
  handsetModel: string | null;
  provider: { name: string; slug: string };
}

async function getRefurbished(): Promise<PlanRow[]> {
  try {
    return await prisma.plan.findMany({
      where: {
        category: "mobile",
        subcategory: "sim-free",
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        monthlyCost: true,
        setupFee: true,
        imageUrl: true,
        affiliateUrl: true,
        handsetModel: true,
        provider: { select: { name: true, slug: true } },
      },
      take: 200,
    });
  } catch (err) {
    console.error("[refurbished] DB unavailable:", err);
    return [];
  }
}

function groupByBrand(plans: PlanRow[]): Map<string, PlanRow[]> {
  const map = new Map<string, PlanRow[]>();
  for (const p of plans) {
    const brand = p.handsetModel || "Other";
    if (!map.has(brand)) map.set(brand, []);
    map.get(brand)!.push(p);
  }
  for (const [k, list] of map.entries()) {
    map.set(k, sortByRecencyThenPrice(list).slice(0, 12));
  }
  return map;
}

const brandGradient = (brand: string): string => {
  const b = brand.toLowerCase();
  if (b.includes("apple") || b.includes("iphone"))
    return "from-slate-400 to-slate-600";
  if (b.includes("samsung") || b.includes("galaxy"))
    return "from-blue-500 to-indigo-600";
  if (b.includes("google") || b.includes("pixel"))
    return "from-teal-500 to-cyan-600";
  if (b.includes("oneplus")) return "from-red-500 to-rose-600";
  if (b.includes("xiaomi") || b.includes("redmi"))
    return "from-orange-500 to-amber-600";
  if (b.includes("motorola")) return "from-purple-500 to-fuchsia-600";
  return "from-emerald-500 to-teal-600";
};

export default async function RefurbishedPage() {
  const all = await getRefurbished();
  const byBrand = groupByBrand(all);

  const flagships = sortByRecencyThenPrice(all)
    .filter((p) => scorePhoneRecency(p.name).score > 0)
    .slice(0, 8);

  const brandOrder = [...byBrand.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([brand]) => brand);

  const cheapest =
    all.length > 0 ? Math.min(...all.map((p) => p.monthlyCost)) : 0;
  const stats = {
    total: all.length,
    brands: byBrand.size,
    cheapest,
    flagshipCount: flagships.length,
  };

  return (
    <div>
      {/* Hero — emerald cinematic */}
      <section className="relative overflow-hidden text-white bg-gradient-to-br from-emerald-700 via-emerald-800 to-slate-900">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-emerald-400/20 blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-teal-400/20 blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
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
            <Badge className="mb-4 bg-gradient-to-r from-emerald-400 to-teal-500 text-white border-0 shadow-lg">
              <Recycle className="size-3 mr-1" />
              Certified refurbished
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.05]">
              The same iPhone.
              <span className="block mt-2 bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent">
                Half the price.
              </span>
            </h1>
            <p className="mt-5 text-lg text-emerald-100/90 leading-relaxed max-w-2xl">
              Hand-checked, fully tested, warranty-backed refurbished phones
              from <strong className="text-white">Mozillion</strong> and other
              vetted UK sellers. Get the iPhone 17 Pro Max, Galaxy S25 or
              Pixel 10 — for what you&apos;d pay for last year&apos;s model
              new.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                asChild
                className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold px-8 shadow-lg"
              >
                <Link href="#flagships">
                  <Sparkles className="size-5" />
                  Browse refurb deals
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/40 bg-white/10 backdrop-blur text-white hover:bg-white/20 font-bold px-8"
              >
                <Link href="/guides/mobile/refurbished-iphone-vs-new-uk">
                  Read buyer&apos;s guide
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
                icon: Recycle,
                value: stats.total.toString(),
                label: "Refurb deals",
                grad: "from-emerald-500 to-teal-600",
              },
              {
                icon: Wallet,
                value: stats.cheapest > 0 ? `£${Math.floor(stats.cheapest)}` : "—",
                label: "Cheapest",
                grad: "from-amber-500 to-orange-600",
              },
              {
                icon: Award,
                value: stats.brands.toString(),
                label: "Phone brands",
                grad: "from-blue-500 to-indigo-600",
              },
              {
                icon: TreePine,
                value: "~50kg",
                label: "CO₂ saved /phone",
                grad: "from-green-500 to-emerald-700",
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

      {/* Trust strip */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: Wallet,
                title: "Save £100s vs new",
                desc: "Same hardware, same warranty — significantly less money.",
                grad: "from-amber-500 to-orange-600",
                bg: "from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40",
              },
              {
                icon: ShieldCheck,
                title: "Warranty-backed",
                desc: "12-month warranty + 14-day no-quibble returns.",
                grad: "from-blue-500 to-indigo-600",
                bg: "from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40",
              },
              {
                icon: Leaf,
                title: "Carbon-friendly",
                desc: "~50kg less CO₂ vs manufacturing a new handset.",
                grad: "from-emerald-500 to-teal-600",
                bg: "from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40",
              },
            ].map((tile) => (
              <div
                key={tile.title}
                className={`relative rounded-2xl bg-gradient-to-br ${tile.bg} border border-border/50 p-5 shadow-sm hover:shadow-lg transition-all overflow-hidden`}
              >
                <div
                  className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${tile.grad}`}
                />
                <div
                  className={`flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${tile.grad} text-white shadow-md mb-3`}
                >
                  <tile.icon className="size-5" />
                </div>
                <h3 className="font-bold mb-1">{tile.title}</h3>
                <p className="text-sm text-muted-foreground">{tile.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest flagships strip */}
      {flagships.length > 0 && (
        <section
          id="flagships"
          className="relative bg-gradient-to-b from-white via-emerald-50/30 to-white dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950 overflow-hidden"
        >
          <div className="absolute top-1/4 -left-32 w-72 h-72 rounded-full bg-emerald-200/40 dark:bg-emerald-900/20 blur-3xl pointer-events-none" />
          <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
              <div>
                <Badge className="mb-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-md">
                  <Flame className="size-3 mr-1" />
                  Newest first
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-bold">
                  Latest flagships, refurbished
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Same iPhone 17 / Galaxy S25 / Pixel 10 — gently pre-loved.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {flagships.map((p, idx) => (
                <FlagshipCard key={p.id} plan={p} hot={idx === 0} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* By brand */}
      <section className="bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900/40 dark:via-slate-950 dark:to-slate-900/40">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16 space-y-12">
          <div className="text-center mb-2">
            <Badge className="mb-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-md">
              Browse by brand
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold">
              Pick your manufacturer
            </h2>
          </div>
          {brandOrder.map((brand) => {
            const list = byBrand.get(brand)!;
            if (list.length === 0) return null;
            const grad = brandGradient(brand);
            const minPrice = Math.min(...list.map((p) => p.monthlyCost));
            return (
              <div key={brand}>
                <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${grad} text-white shadow-md`}
                    >
                      <span className="text-base font-extrabold">
                        {brand.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{brand}</h3>
                      <p className="text-xs text-muted-foreground">
                        {list.length} model{list.length !== 1 ? "s" : ""} ·
                        from £{minPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {list.slice(0, 8).map((p) => (
                    <CompactCard key={p.id} plan={p} brandGrad={grad} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* About refurbished */}
      <section className="bg-background">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:py-20">
          <Badge className="mb-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-md">
            <Clock className="size-3 mr-1" />
            Buyer&apos;s guide
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Why refurbished?
          </h2>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p>
              A refurbished phone is a returned or trade-in handset
              that&apos;s been professionally inspected, repaired where
              needed, deep-cleaned, and re-certified to work like new. You
              get the same hardware as a brand-new phone — same screen, same
              camera, same battery — for hundreds less.
            </p>
            <p>
              <strong>Our partners grade by condition</strong>:{" "}
              <em>Like New</em>, <em>Excellent</em>, <em>Good</em>,{" "}
              <em>Fair</em>. Every phone ships with a 12-month warranty and a
              14-day no-quibble return.
            </p>
          </div>
          <div className="mt-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white p-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                <Sparkles className="size-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Want to dig deeper?</h3>
                <p className="text-sm text-emerald-100 mt-1">
                  Our 9-minute buyer&apos;s guide breaks down condition
                  grades, warranty cover and how much you actually save in
                  Year 1.
                </p>
              </div>
              <Button
                asChild
                className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold shrink-0"
              >
                <Link href="/guides/mobile/refurbished-iphone-vs-new-uk">
                  Read guide
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FlagshipCard({ plan, hot }: { plan: PlanRow; hot?: boolean }) {
  const recency = scorePhoneRecency(plan.name);
  return (
    <Link href={`/deals/${plan.slug}`} className="group block">
      <div className="relative h-full">
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-emerald-400/40 to-teal-500/30 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 pointer-events-none" />
        <Card className="relative h-full border border-border/60 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all hover:-translate-y-1.5 hover:shadow-2xl">
          <CardContent className="p-4">
            <div className="relative aspect-square rounded-xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 mb-3 overflow-hidden">
              {plan.imageUrl ? (
                <Image
                  src={plan.imageUrl}
                  alt={plan.name}
                  fill
                  className="object-contain p-3 group-hover:scale-110 group-hover:rotate-2 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-3xl">
                  📱
                </div>
              )}
              {recency.modelLabel && (
                <Badge className="absolute top-2 left-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white border-0 text-[10px] shadow-md">
                  {recency.modelLabel.split(" ").slice(0, 2).join(" ")}
                </Badge>
              )}
              {hot && (
                <Badge className="absolute top-2 right-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white border-0 text-[10px] shadow-md flex items-center gap-0.5">
                  <Flame className="size-2.5" />
                  Hot
                </Badge>
              )}
            </div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400">
              {plan.provider.name}
            </p>
            <p className="text-sm font-bold leading-tight line-clamp-2 mt-0.5 mb-2 min-h-[2.5rem]">
              {plan.name}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold bg-gradient-to-br from-emerald-600 to-teal-700 bg-clip-text text-transparent tabular-nums">
                £{Math.floor(plan.monthlyCost)}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                total
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </Link>
  );
}

function CompactCard({
  plan,
  brandGrad,
}: {
  plan: PlanRow;
  brandGrad: string;
}) {
  return (
    <Link href={`/deals/${plan.slug}`} className="group">
      <div className="rounded-xl border border-border/60 bg-white dark:bg-slate-800/50 p-3 hover:shadow-lg hover:-translate-y-1 hover:border-emerald-200 dark:hover:border-emerald-900 transition-all">
        <div className="relative aspect-square rounded-lg bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 mb-2 overflow-hidden">
          {plan.imageUrl ? (
            <Image
              src={plan.imageUrl}
              alt={plan.name}
              fill
              className="object-contain p-2 group-hover:scale-110 transition-transform"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-2xl">
              📱
            </div>
          )}
        </div>
        <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground truncate">
          {plan.provider.name}
        </p>
        <p className="text-xs font-bold leading-tight line-clamp-2 mb-1.5 min-h-[2rem]">
          {plan.name}
        </p>
        <div
          className={`inline-block rounded-md bg-gradient-to-r ${brandGrad} px-2 py-0.5 text-white text-sm font-extrabold shadow-sm tabular-nums`}
        >
          £{plan.monthlyCost.toFixed(2)}
        </div>
      </div>
    </Link>
  );
}
