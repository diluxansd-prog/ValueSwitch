import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { ProvidersManagement } from "@/components/admin/providers-management";

export const metadata: Metadata = {
  title: "Manage Providers | Admin | ValueSwitch",
};

export const dynamic = "force-dynamic";

export default async function AdminProvidersPage() {
  const providers = await prisma.provider.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      website: true,
      trustScore: true,
      reviewCount: true,
      isActive: true,
      categories: true,
      _count: {
        select: { plans: true, reviews: true },
      },
    },
  });

  return (
    <ProvidersManagement
      providers={providers.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        website: p.website || "",
        trustScore: p.trustScore || 0,
        reviewCount: p.reviewCount,
        isActive: p.isActive,
        categories: p.categories,
        planCount: p._count.plans,
        reviewsCount: p._count.reviews,
      }))}
    />
  );
}
