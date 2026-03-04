import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { PriceAlertsClient } from "@/components/dashboard/price-alerts-client";

export const metadata: Metadata = {
  title: "Price Alerts | ValueSwitch",
  description: "Manage your price alerts and get notified when deals match your criteria.",
};

export default async function AlertsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const alerts = await prisma.priceAlert.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      category: true,
      subcategory: true,
      postcode: true,
      targetPrice: true,
      isActive: true,
      lastTriggered: true,
      createdAt: true,
    },
  });

  return (
    <PriceAlertsClient
      alerts={alerts.map((a) => ({
        id: a.id,
        category: a.category,
        subcategory: a.subcategory,
        postcode: a.postcode,
        targetPrice: a.targetPrice,
        isActive: a.isActive,
        lastTriggered: a.lastTriggered?.toISOString() || null,
        createdAt: a.createdAt.toISOString(),
      }))}
    />
  );
}
