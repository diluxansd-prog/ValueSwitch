import { TrendingUp, Building2, RefreshCw, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";

/**
 * Compact stats bar shown right under the hero. Real-time numbers from
 * the DB — gives credibility before users scroll into the deal cards.
 */
export async function LiveStats() {
  let plans = 0;
  let providers = 0;
  let lastImport: Date | null = null;
  const available = { provider: { isActive: true }, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] };
  try {
    [plans, providers, lastImport] = await Promise.all([
      prisma.plan.count({ where: available }),
      prisma.provider.count({ where: { isActive: true } }),
      prisma.plan
        .findFirst({
          where: available,
          orderBy: { updatedAt: "desc" },
          select: { updatedAt: true },
        })
        .then((p) => p?.updatedAt ?? null),
    ]);
  } catch {
    // Fail silent — section just won't render
    return null;
  }

  const items = [
    {
      icon: TrendingUp,
      value: plans.toLocaleString("en-GB"),
      label: "Listed deals",
      color: "from-emerald-500 to-emerald-700",
    },
    {
      icon: Building2,
      value: String(providers),
      label: "Active providers",
      color: "from-blue-500 to-blue-700",
    },
    {
      icon: RefreshCw,
      value: lastImport?.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" }) ?? "Unavailable",
      label: "Latest listing update",
      color: "from-purple-500 to-purple-700",
    },
    {
      icon: Sparkles,
      value: "Free",
      label: "To compare",
      color: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <section className="border-y bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900/40 dark:via-slate-900/20 dark:to-slate-900/40 relative">
      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
          {items.map((item) => (
            <div
              key={item.label}
              className="text-center sm:text-left flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div
                className={`mx-auto sm:mx-0 size-11 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-lg shrink-0`}
              >
                <item.icon className="size-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold tabular-nums">
                  {item.value}
                </div>
                <div className="text-[11px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
