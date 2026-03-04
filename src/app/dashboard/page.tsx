import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { DashboardOverviewClient } from "@/components/dashboard/dashboard-overview";

export const metadata: Metadata = {
  title: "Dashboard | ValueSwitch",
  description: "View your comparison activity, saved searches, and price alerts.",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [savedSearchCount, alertCount, comparisonCount, recentComparisons] =
    await Promise.all([
      prisma.savedSearch.count({ where: { userId } }),
      prisma.priceAlert.count({ where: { userId, isActive: true } }),
      prisma.comparisonHistory.count({ where: { userId } }),
      prisma.comparisonHistory.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          category: true,
          subcategory: true,
          resultCount: true,
          createdAt: true,
        },
      }),
    ]);

  return (
    <DashboardOverviewClient
      userName={session.user.name || "there"}
      stats={{
        savedSearches: savedSearchCount,
        activeAlerts: alertCount,
        comparisons: comparisonCount,
      }}
      recentComparisons={recentComparisons.map((c) => ({
        id: c.id,
        category: c.category,
        subcategory: c.subcategory,
        resultCount: c.resultCount,
        createdAt: c.createdAt.toISOString(),
      }))}
    />
  );
}
