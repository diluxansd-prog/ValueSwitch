import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, MousePointerClick, Users, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Click Analytics | Admin | ValueSwitch",
};
export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 3600 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
  const last30d = new Date(now.getTime() - 30 * 24 * 3600 * 1000);

  const [total24h, total7d, total30d, byPlan, byProvider, uniqueUsers, recent] =
    await Promise.all([
      prisma.clickEvent.count({ where: { createdAt: { gte: last24h } } }),
      prisma.clickEvent.count({ where: { createdAt: { gte: last7d } } }),
      prisma.clickEvent.count({ where: { createdAt: { gte: last30d } } }),

      // Top 20 clicked plans (last 30 days)
      prisma.clickEvent.groupBy({
        by: ["planId"],
        where: { createdAt: { gte: last30d } },
        _count: { _all: true },
        orderBy: { _count: { planId: "desc" } },
        take: 20,
      }),

      // Clicks grouped by provider (last 30 days)
      prisma.clickEvent.groupBy({
        by: ["providerId"],
        where: { createdAt: { gte: last30d } },
        _count: { _all: true },
      }),

      // Unique users who clicked (last 30 days)
      prisma.clickEvent.findMany({
        where: { createdAt: { gte: last30d }, userId: { not: null } },
        select: { userId: true },
        distinct: ["userId"],
      }),

      prisma.clickEvent.findMany({
        orderBy: { createdAt: "desc" },
        take: 25,
      }),
    ]);

  // Hydrate plan + provider details for top clicks
  const planIds = byPlan.map((b) => b.planId);
  const providerIds = byProvider.map((b) => b.providerId);
  const [plans, providers] = await Promise.all([
    prisma.plan.findMany({
      where: { id: { in: planIds } },
      select: {
        id: true,
        name: true,
        monthlyCost: true,
        provider: { select: { name: true, slug: true } },
      },
    }),
    prisma.provider.findMany({
      where: { id: { in: providerIds } },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  const planMap = new Map(plans.map((p) => [p.id, p]));
  const providerMap = new Map(providers.map((p) => [p.id, p]));

  // Recent click hydration
  const recentPlanIds = [...new Set(recent.map((r) => r.planId))];
  const recentPlans = await prisma.plan.findMany({
    where: { id: { in: recentPlanIds } },
    select: {
      id: true,
      name: true,
      provider: { select: { name: true } },
    },
  });
  const recentPlanMap = new Map(recentPlans.map((p) => [p.id, p]));

  const cards = [
    { label: "Clicks (24h)", value: total24h, icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Clicks (7d)", value: total7d, icon: MousePointerClick, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Clicks (30d)", value: total30d, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Unique users (30d)", value: uniqueUsers.length, icon: Users, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Click Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Affiliate click performance across all providers
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold mt-1">{s.value}</p>
                </div>
                <div className={`${s.bg} p-3 rounded-lg`}>
                  <s.icon className={`size-5 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top plans */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Clicked Deals (30d)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {byPlan.slice(0, 15).map((b, idx) => {
                const plan = planMap.get(b.planId);
                if (!plan) return null;
                return (
                  <div key={b.planId} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono text-muted-foreground w-6">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{plan.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {plan.provider.name} · £{plan.monthlyCost}/mo
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {b._count._all} clicks
                    </Badge>
                  </div>
                );
              })}
              {byPlan.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No clicks yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* By provider */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Clicks by Provider (30d)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {byProvider
                .sort((a, b) => b._count._all - a._count._all)
                .map((b) => {
                  const provider = providerMap.get(b.providerId);
                  if (!provider) return null;
                  const total = byProvider.reduce((s, x) => s + x._count._all, 0);
                  const pct = total > 0 ? (b._count._all / total) * 100 : 0;
                  return (
                    <div key={b.providerId} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium">{provider.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {b._count._all} ({pct.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#1a365d] to-[#38a169]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              {byProvider.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No clicks yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent clicks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Clicks</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Deal</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Referrer</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">User</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">When</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((c) => {
                  const plan = recentPlanMap.get(c.planId);
                  const ref = c.referrer ? new URL(c.referrer).pathname : null;
                  return (
                    <tr key={c.id} className="border-b last:border-0">
                      <td className="px-4 py-2.5">
                        {plan ? (
                          <div>
                            <p className="text-xs font-medium truncate max-w-[250px]">
                              {plan.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {plan.provider.name}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            deleted plan
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground hidden sm:table-cell">
                        {ref || "direct"}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground hidden md:table-cell">
                        {c.userId ? "🔐 logged in" : "👤 anon"}
                      </td>
                      <td className="px-4 py-2.5 text-right text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleString("en-GB")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {recent.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No clicks logged yet. Once users click &ldquo;Go to Vodafone&rdquo;, they&apos;ll appear here.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
