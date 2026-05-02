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
  try {
    [plans, providers, lastImport] = await Promise.all([
      prisma.plan.count(),
      prisma.provider.count({ where: { isActive: true } }),
      prisma.plan
        .findFirst({
          orderBy: { updatedAt: "desc" },
          select: { updatedAt: true },
        })
        .then((p) => p?.updatedAt ?? null),
    ]);
  } catch {
    // Fail silent — section just won't render
    return null;
  }

  const fmtRel = (d: Date | null) => {
    if (!d) return "today";
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const items = [
    {
      icon: TrendingUp,
      value: plans.toLocaleString("en-GB"),
      label: "Live deals",
      color: "from-emerald-500 to-emerald-700",
    },
    {
      icon: Building2,
      value: String(providers),
      label: "Verified retailers",
      color: "from-blue-500 to-blue-700",
    },
    {
      icon: RefreshCw,
      value: fmtRel(lastImport),
      label: "Last refresh",
      color: "from-purple-500 to-purple-700",
    },
    {
      icon: Sparkles,
      value: "0",
      label: "Hidden fees",
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
