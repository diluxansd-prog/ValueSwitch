import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { PlansManagement } from "@/components/admin/plans-management";

export const metadata: Metadata = {
  title: "Manage Plans | Admin | ValueSwitch",
};

export const dynamic = "force-dynamic";

export default async function AdminPlansPage() {
  const plans = await prisma.plan.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      subcategory: true,
      monthlyCost: true,
      isPromoted: true,
      isBestValue: true,
      isPopular: true,
      provider: { select: { name: true } },
    },
  });

  const categories = await prisma.plan.groupBy({
    by: ["category"],
    _count: { id: true },
  });

  return (
    <PlansManagement
      plans={plans.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category,
        subcategory: p.subcategory || "",
        monthlyCost: p.monthlyCost,
        isPromoted: p.isPromoted,
        isBestValue: p.isBestValue,
        isPopular: p.isPopular,
        providerName: p.provider.name,
      }))}
      categories={categories.map((c) => c.category)}
    />
  );
}
