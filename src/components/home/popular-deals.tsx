import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Flame, Trophy, Award, Medal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProviderLogo } from "@/components/shared/provider-logo";
import { getPopularDeals } from "@/lib/services/deal.service";
import { getBrandColor } from "@/config/brand-colors";

/**
 * Leaderboard-style popular deals. The first three picks get medal-coloured
 * rank chips (gold/silver/bronze); the rest get a numbered chip in brand navy.
 * Brand-coloured price tile pulls colours from `getBrandColor` so each card
 * looks distinct even at a glance.
 */
export async function PopularDeals() {
  const deals = await getPopularDeals("mobile", 6);
  if (deals.length === 0) return null;

  const rankStyles = [
    {
      // #1 — gold
      ring: "ring-2 ring-amber-400/50",
      chip: "from-amber-400 to-yellow-500",
      icon: Trophy,
      label: "Top pick",
      labelClass: "from-amber-500 to-orange-500",
    },
    {
      // #2 — silver
      ring: "",
      chip: "from-slate-300 to-slate-500",
      icon: Award,
      label: "Best value",
      labelClass: "from-slate-400 to-slate-600",
    },
    {
      // #3 — bronze
      ring: "",
      chip: "from-orange-400 to-amber-700",
      icon: Medal,
      label: "Editor's pick",
      labelClass: "from-orange-400 to-amber-600",
    },
  ];

  return (
    <section className="relative bg-gradient-to-b from-slate-50 via-rose-50/20 to-slate-50 dark:from-slate-900/60 dark:via-rose-950/10 dark:to-slate-900/60 overflow-hidden">
      {/* Side glow halos */}
      <div className="absolute top-1/2 -translate-y-1/2 -left-32 w-72 h-72 rounded-full bg-rose-200/40 dark:bg-rose-900/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -translate-y-1/2 -right-32 w-72 h-72 rounded-full bg-amber-200/40 dark:bg-amber-900/20 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <Badge className="mb-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white border-0 shadow-md">
              <Flame className="size-3 mr-1" />
              Most clicked this week
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Popular deals leaderboard
            </h2>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Real deals from our affiliate partners, ranked by what UK
              shoppers are actually choosing right now.
            </p>
          </div>
          <Button
            variant="outline"
            asChild
            className="shrink-0 border-rose-200 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950"
          >
            <Link href="/mobile/compare">
              View all deals
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="space-y-3">
          {deals.map((deal, idx) => {
            const priceWhole = Math.floor(deal.monthlyCost);
            const pricePence = Math.round(
              (deal.monthlyCost - priceWhole) * 100
            );
            const cleanName = deal.name.replace(/ - £[\d.]+\/mo.*/, "");
            const rank = idx < 3 ? rankStyles[idx] : null;
            const RankIcon = rank?.icon;
            const brand = getBrandColor(deal.provider.slug);
            const priceGrad = brand
              ? { from: brand.from, to: brand.to }
              : { from: "#1a365d", to: "#38a169" };

            return (
              <div
                key={deal.id}
                className={`group relative rounded-2xl bg-white dark:bg-slate-900/80 border border-border/60 ${rank?.ring ?? ""} shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden`}
              >
                {/* Rank accent bar on left */}
                {rank && (
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${rank.chip}`}
                  />
                )}

                <div className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                    {/* Rank chip */}
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

                    {/* Provider + image */}
                    <div className="flex items-center gap-3 sm:w-[260px] sm:shrink-0 min-w-0">
                      {deal.imageUrl ? (
                        <div className="relative size-14 shrink-0 rounded-lg bg-slate-50 dark:bg-slate-800/50 ring-1 ring-border/50">
                          <Image
                            src={deal.imageUrl}
                            alt={deal.name}
                            fill
                            className="object-contain p-1.5 group-hover:scale-110 transition-transform duration-300"
                            sizes="56px"
                          />
                        </div>
                      ) : (
                        <ProviderLogo
                          name={deal.provider.name}
                          slug={deal.provider.slug}
                          logo={deal.provider.logo}
                          size={50}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {deal.provider.name}
                          </p>
                          {rank && (
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r ${rank.labelClass} bg-clip-text text-transparent`}
                            >
                              {rank.label}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold leading-tight line-clamp-2 mt-0.5">
                          {cleanName}
                        </h3>
                      </div>
                    </div>

                    {/* Data */}
                    {deal.dataAllowance && (
                      <div className="text-center sm:flex-1 px-3 py-2 sm:py-0 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 sm:bg-transparent sm:dark:bg-transparent">
                        <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">
                          {deal.dataAllowance.replace(/GB/i, "")}
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-500 ml-0.5">
                            GB
                          </span>
                        </p>
                        <p className="text-[10px] text-muted-foreground font-medium">
                          {deal.networkType
                            ? `${deal.networkType} data`
                            : "data"}
                        </p>
                      </div>
                    )}

                    {/* Price tile — brand-coloured gradient */}
                    <div className="text-center sm:text-right sm:shrink-0 sm:min-w-[140px]">
                      <div
                        className="rounded-xl px-4 py-2 text-white shadow-md inline-block sm:w-full sm:text-right"
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
                            {deal.contractLength}-month contract
                          </p>
                        )}
                      </div>
                    </div>

                    {/* CTA */}
                    <Button
                      asChild
                      className="bg-gradient-to-r from-[#1a365d] to-[#38a169] hover:from-[#2a4a7f] hover:to-[#48bb78] text-white border-0 font-semibold px-6 sm:shrink-0 shadow-md hover:shadow-lg transition-all"
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
  );
}
