import { prisma } from "@/lib/prisma";
import type { PlanWithProvider } from "@/types/comparison";

export function parseFeatures(value: string | null): string[] {
  if (!value) return [];
  try { const parsed: unknown = JSON.parse(value); return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []; } catch { return []; }
}

export async function getCatalogue(category: string, subcategory?: string): Promise<{ plans: PlanWithProvider[]; unavailable: boolean }> {
  try {
    const plans = await prisma.plan.findMany({ where: { category, ...(subcategory && { subcategory }), provider: { isActive: true }, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }, include: { provider: true }, orderBy: { monthlyCost: "asc" }, take: 200 });
    return { plans: plans.map(plan => ({ ...plan, features: parseFeatures(plan.features) })), unavailable: false };
  } catch { return { plans: [], unavailable: true }; }
}
