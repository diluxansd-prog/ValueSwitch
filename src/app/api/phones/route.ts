import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get all plans with images grouped by handset brand
    const plans = await prisma.plan.findMany({
      where: {
        category: "mobile",
        imageUrl: { not: null },
        handsetModel: { not: null },
      },
      select: {
        handsetModel: true,
        imageUrl: true,
        monthlyCost: true,
        setupFee: true,
      },
      orderBy: { monthlyCost: "asc" },
    });

    const byBrand = new Map<string, {
      brand: string;
      image: string;
      cheapestPrice: number;
      setupFee: number;
      dealCount: number;
    }>();

    for (const plan of plans) {
      const brand = plan.handsetModel || "Unknown";
      if (brand === "Unknown" || brand === "Vodafone") continue;

      if (!byBrand.has(brand)) {
        byBrand.set(brand, {
          brand,
          image: plan.imageUrl!,
          cheapestPrice: plan.monthlyCost,
          setupFee: plan.setupFee,
          dealCount: 0,
        });
      }
      byBrand.get(brand)!.dealCount++;
      if (plan.monthlyCost < byBrand.get(brand)!.cheapestPrice) {
        byBrand.get(brand)!.cheapestPrice = plan.monthlyCost;
        byBrand.get(brand)!.image = plan.imageUrl!;
        byBrand.get(brand)!.setupFee = plan.setupFee;
      }
    }

    // Sort by deal count (most popular first), take top 8
    const phones = [...byBrand.values()]
      .sort((a, b) => b.dealCount - a.dealCount)
      .slice(0, 8);

    return NextResponse.json(phones);
  } catch {
    return NextResponse.json([]);
  }
}
