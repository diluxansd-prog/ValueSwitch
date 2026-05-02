import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Recycle, ShieldCheck, Leaf, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { sortByRecencyThenPrice, scorePhoneRecency } from "@/lib/utils/phone-recency";

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
  // Sort each brand bucket by recency desc, then price asc
  for (const [k, list] of map.entries()) {
    map.set(k, sortByRecencyThenPrice(list).slice(0, 12));
  }
  return map;
}

export default async function RefurbishedPage() {
  const all = await getRefurbished();
  const byBrand = groupByBrand(all);

  // Build flagship strip — top recency-scored phones across all brands
  const flagships = sortByRecencyThenPrice(all)
    .filter((p) => scorePhoneRecency(p.name).score > 0)
    .slice(0, 8);

  // Order brand list by largest catalogue first
  const brandOrder = [...byBrand.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([brand]) => brand);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-800 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, rgba(72, 187, 120, 0.6) 0%, transparent 45%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.3) 0%, transparent 45%)",
            }}
          />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-white/15 text-white border-white/20 hover:bg-white/20">
              <Recycle className="size-3.5 mr-1.5" />
              Certified refurbished
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-[1.05]">
              The same iPhone.{" "}
              <span className="text-emerald-300">Half the price.</span>
            </h1>
            <p className="mt-5 text-lg text-emerald-100/90 leading-relaxed">
              Hand-checked, fully tested, and warranty-backed refurbished phones from{" "}
              <strong>Mozillion</strong> and other vetted UK sellers. Get the iPhone
              17 Pro Max, Galaxy S25 or Pixel 10 — for what you'd pay for last
              year's model new.
            </p>
            <div className="mt-7 grid grid-cols-3 gap-4 max-w-md">
              <Stat label="Savings" value="up to 50%" />
              <Stat label="Tested" value="70+ checks" />
              <Stat label="Warranty" value="12 months" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 px-4 py-5 sm:px-6">
          <TrustBadge icon={<Wallet className="size-5 text-emerald-600" />} text="Save £100s vs new" />
          <TrustBadge icon={<ShieldCheck className="size-5 text-emerald-600" />} text="Warranty-backed" />
          <TrustBadge icon={<Leaf className="size-5 text-emerald-600" />} text="Carbon-friendly choice" />
        </div>
      </section>

      {/* Latest flagships strip */}
      {flagships.length > 0 && (
        <section className="bg-background">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold">Latest flagships, refurbished</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Newest models first — the same phone, just gently pre-loved.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {flagships.map((p) => (
                <FlagshipCard key={p.id} plan={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* By brand */}
      <section className="bg-slate-50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16 space-y-12">
          {brandOrder.map((brand) => {
            const list = byBrand.get(brand)!;
            if (list.length === 0) return null;
            return (
              <div key={brand}>
                <div className="flex items-end justify-between mb-5">
                  <h3 className="text-xl font-bold">{brand}</h3>
                  <span className="text-xs text-muted-foreground">
                    {list.length} model{list.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {list.slice(0, 8).map((p) => (
                    <CompactCard key={p.id} plan={p} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* About refurbished */}
      <section className="bg-background">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:py-20 prose prose-slate dark:prose-invert">
          <h2>Why refurbished?</h2>
          <p>
            A refurbished phone is a returned or trade-in handset that's been
            professionally inspected, repaired where needed, deep-cleaned, and
            re-certified to work like new. You get the same hardware as a brand-new
            phone — same screen, same camera, same battery — for hundreds less.
          </p>
          <p>
            <strong>Our partners grade by condition</strong>: <em>Like New</em>,{" "}
            <em>Excellent</em>, <em>Good</em>, <em>Fair</em>. Every phone ships
            with a 12-month warranty and a 14-day no-quibble return.
          </p>
          <p>
            <Link href="/guides/mobile/refurbished-iphone-vs-new-uk">
              Read our refurbished iPhone vs new buyer's guide →
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-emerald-100/70 mt-0.5">{label}</div>
    </div>
  );
}

function TrustBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function FlagshipCard({ plan }: { plan: PlanRow }) {
  const recency = scorePhoneRecency(plan.name);
  return (
    <Link href={`/deals/${plan.slug}`} className="group">
      <Card className="h-full border border-border/60 transition-all hover:-translate-y-1 hover:shadow-xl">
        <CardContent className="p-4">
          <div className="relative aspect-square rounded-xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 mb-3 overflow-hidden">
            {plan.imageUrl ? (
              <Image
                src={plan.imageUrl}
                alt={plan.name}
                fill
                className="object-contain p-3 group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-3xl">📱</div>
            )}
            {recency.modelLabel && (
              <Badge className="absolute top-2 left-2 bg-emerald-600 text-white border-0 text-[10px]">
                {recency.modelLabel.split(" ").slice(0, 2).join(" ")}
              </Badge>
            )}
          </div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-0.5">
            {plan.provider.name}
          </p>
          <p className="text-sm font-semibold leading-tight line-clamp-2 mb-2">
            {plan.name}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold">£{plan.monthlyCost.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground">total</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function CompactCard({ plan }: { plan: PlanRow }) {
  return (
    <Link href={`/deals/${plan.slug}`} className="group">
      <div className="rounded-xl border border-border/60 bg-white dark:bg-slate-800/50 p-3 hover:shadow-md hover:-translate-y-0.5 transition-all">
        <div className="relative aspect-square rounded-lg bg-slate-50 dark:bg-slate-900 mb-2 overflow-hidden">
          {plan.imageUrl ? (
            <Image
              src={plan.imageUrl}
              alt={plan.name}
              fill
              className="object-contain p-2"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-2xl">📱</div>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground truncate">{plan.provider.name}</p>
        <p className="text-xs font-semibold leading-tight line-clamp-2 mb-1.5">{plan.name}</p>
        <p className="text-sm font-bold">£{plan.monthlyCost.toFixed(2)}</p>
      </div>
    </Link>
  );
}
