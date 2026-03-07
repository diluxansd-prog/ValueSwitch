import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { AdminOverviewClient } from "@/components/admin/admin-overview";

export const metadata: Metadata = {
  title: "Admin Dashboard | ValueSwitch",
  description: "Admin overview and statistics.",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [
    userCount,
    providerCount,
    planCount,
    guideCount,
    recentUsers,
    categoryStats,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.provider.count(),
    prisma.plan.count(),
    prisma.guide.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.plan.groupBy({
      by: ["category"],
      _count: { id: true },
    }),
  ]);

  return (
    <AdminOverviewClient
      stats={{
        users: userCount,
        providers: providerCount,
        plans: planCount,
        guides: guideCount,
      }}
      recentUsers={recentUsers.map((u) => ({
        ...u,
        name: u.name || "No name",
        createdAt: u.createdAt.toISOString(),
      }))}
      categoryStats={categoryStats.map((c) => ({
        category: c.category,
        count: c._count.id,
      }))}
    />
  );
}
