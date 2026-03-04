import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ComparisonHistoryClient } from "@/components/dashboard/comparison-history-client";

export const metadata: Metadata = {
  title: "Comparison History | ValueSwitch",
  description: "View your past comparisons and re-run them anytime.",
};

export default async function ComparisonHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const comparisons = await prisma.comparisonHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      category: true,
      subcategory: true,
      postcode: true,
      resultCount: true,
      createdAt: true,
    },
  });

  return (
    <ComparisonHistoryClient
      comparisons={comparisons.map((c) => ({
        id: c.id,
        category: c.category,
        subcategory: c.subcategory,
        postcode: c.postcode,
        resultCount: c.resultCount,
        createdAt: c.createdAt.toISOString(),
      }))}
    />
  );
}
