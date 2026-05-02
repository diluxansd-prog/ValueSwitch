import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { scorePhoneRecency, sortByRecencyThenPrice } from "@/lib/utils/phone-recency";

/**
 * Hand-picks the most modern phones available across the catalogue and
 * surfaces them on the home page. iPhone 17 Pro Max ranks above iPhone 13;
 * Galaxy S25 above S22, etc.
 *
 * Pulls a wide candidate pool (top 200 cheapest mobile plans WITH images)
 * and re-sorts client-side by phone-model recency. We over-fetch on
 * purpose so post-filter we still have enough cards to show 8.
 */
export async function LatestPhones() {
  let candidates: Array<{
    id: string;
    name: string;
    slug: string;
    monthlyCost: number;
    setupFee: number;
    contractLength: number | null;
    imageUrl: string | null;
    subcategory: string | null;
    handsetModel: string | null;
    provider: { name: string; slug: string };
  }> = [];
  try {
    candidates = await prisma.plan.findMany({
      where: {
        category: "mobile",
        imageUrl: { not: null },
        handsetModel: { not: null },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { monthlyCost: "asc" },
      take: 200,
      select: {
        id: true,
        name: true,
        slug: true,
        monthlyCost: true,
        setupFee: true,
        contractLength: true,
        imageUrl: true,
        subcategory: true,
        handsetModel: true,
        provider: { select: { name: true, slug: true } },
      },
    });
  } catch (err) {
    console.error("[LatestPhones] DB unavailable, hiding section:", err);
    return null;
  }

  const flagships = sortByRecencyThenPrice(candidates).filter(
    (c) => scorePhoneRecency(c.name).score > 0
  );

  if (flagships.length === 0) return null;

  // Dedupe by (handsetModel + recency model label) so we don't show three
  // variants of the same phone — pick the cheapest representative for each.
  const seen = new Set<string>();
  const picks: typeof flagships = [];
  for (const f of flagships) {
    const r = scorePhoneRecency(f.name);
    const key = `${f.handsetModel ?? ""}|${r.modelLabel}`;
    if (seen.has(key)) continue;
    seen.add(key);
    picks.push(f);
    if (picks.length >= 8) break;
  }

  // Glow colour per phone family — matches the brand vibe (Apple silver,
  // Samsung blue, Pixel teal, generic indigo).
  const glowFor = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes("iphone")) return "from-slate-300/40 to-slate-500/30";
    if (n.includes("galaxy") || n.includes("samsung"))
      return "from-blue-400/40 to-indigo-500/30";
    if (n.includes("pixel") || n.includes("google"))
      return "from-teal-400/40 to-cyan-500/30";
    if (n.includes("oneplus")) return "from-red-400/40 to-rose-500/30";
    if (n.includes("xiaomi") || n.includes("redmi"))
      return "from-orange-400/40 to-amber-500/30";
    return "from-indigo-400/40 to-purple-500/30";
  };

  return (
    <section className="relative bg-gradient-to-b from-white via-indigo-50/30 to-white dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-950 overflow-hidden">
      {/* Decorative dot grid */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      {/* Side glows */}
      <div className="absolute top-1/4 -left-32 w-72 h-72 rounded-full bg-indigo-200/40 dark:bg-indigo-900/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-72 h-72 rounded-full bg-purple-200/40 dark:bg-purple-900/20 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <Badge className="mb-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-md">
              <Sparkles className="size-3 mr-1" />
              Just dropped — 2026 line-up
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Latest flagship phones
            </h2>
            <p className="mt-2 text-muted-foreground max-w-xl">
              The phones everyone's actually buying right now — iPhone 17,
              Galaxy S25, Pixel 10. Live affiliate prices, no padding.
            </p>
          </div>
          <Button
            variant="outline"
            asChild
            className="shrink-0 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-900 dark:hover:bg-indigo-950"
          >
            <Link href="/mobile">
              Browse all phones
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {picks.map((p, idx) => {
            const recency = scorePhoneRecency(p.name);
            const isSimFree = p.subcategory === "sim-free";
            const glow = glowFor(p.name);
            const isHottest = idx === 0;

            return (
              <Link key={p.id} href={`/deals/${p.slug}`} className="group block">
                <div className="relative h-full">
                  {/* Glow halo on hover */}
                  <div
                    className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-br ${glow} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 pointer-events-none`}
                  />
                  <div className="relative h-full rounded-2xl bg-white dark:bg-slate-900/80 border border-border/60 p-3 shadow-sm group-hover:shadow-2xl group-hover:-translate-y-1.5 group-hover:border-indigo-200 dark:group-hover:border-indigo-800 transition-all duration-300">
                    <div className="relative aspect-square rounded-xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 mb-3 overflow-hidden">
                      {p.imageUrl ? (
                        <Image
                          src={p.imageUrl}
                          alt={p.name}
                          fill
                          className="object-contain p-3 group-hover:scale-110 group-hover:rotate-2 transition-transform duration-500"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center text-3xl">
                          📱
                        </div>
                      )}
                      {recency.modelLabel && (
                        <Badge className="absolute top-2 left-2 bg-gradient-to-r from-[#1a365d] to-[#2a4a7f] text-white border-0 text-[10px] shadow-md">
                          {recency.modelLabel.split(" ").slice(0, 2).join(" ")}
                        </Badge>
                      )}
                      {isSimFree && (
                        <Badge className="absolute top-2 right-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white border-0 text-[10px] shadow-md">
                          Refurb
                        </Badge>
                      )}
                      {isHottest && !isSimFree && (
                        <Badge className="absolute top-2 right-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white border-0 text-[10px] shadow-md flex items-center gap-0.5">
                          <Flame className="size-2.5" />
                          Hot
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400">
                      {p.provider.name}
                    </p>
                    <p className="text-sm font-bold leading-tight line-clamp-2 mt-0.5 mb-2 min-h-[2.5rem]">
                      {p.name.replace(/ - £[\d.]+\/mo.*/, "")}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[10px] text-muted-foreground font-medium">
                        from
                      </span>
                      <span className="text-2xl font-extrabold tabular-nums bg-gradient-to-br from-[#1a365d] to-[#38a169] bg-clip-text text-transparent">
                        £{Math.floor(p.monthlyCost)}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        {isSimFree ? "total" : "/mo"}
                      </span>
                    </div>
                    {!isSimFree && p.contractLength && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {p.contractLength}-month contract
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
