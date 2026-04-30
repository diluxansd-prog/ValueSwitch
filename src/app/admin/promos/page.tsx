import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { PromosManagement } from "@/components/admin/promos-management";

export const metadata: Metadata = {
  title: "Promo Banners | Admin | ValueSwitch",
};
export const dynamic = "force-dynamic";

export default async function AdminPromosPage() {
  const [promos, providers] = await Promise.all([
    prisma.merchantPromo.findMany({
      orderBy: [{ isActive: "desc" }, { startsAt: "desc" }],
    }),
    prisma.provider.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <PromosManagement
      promos={promos.map((p) => ({
        id: p.id,
        title: p.title,
        subtitle: p.subtitle,
        code: p.code,
        ctaLabel: p.ctaLabel,
        ctaUrl: p.ctaUrl,
        emoji: p.emoji,
        bgGradient: p.bgGradient,
        startsAt: p.startsAt.toISOString(),
        endsAt: p.endsAt.toISOString(),
        isActive: p.isActive,
        priority: p.priority,
        providerId: p.providerId,
      }))}
      providers={providers}
    />
  );
}
