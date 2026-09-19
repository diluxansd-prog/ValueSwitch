import { prisma } from "@/lib/prisma";
import { HeroSection } from "./hero-section";

/** Omit counters when the database cannot provide current listings. */
export async function HeroSectionServer() {
  let stats: { deals: number; providers: number } | undefined;
  try {
    const [deals, providers] = await Promise.all([
      prisma.plan.count({ where: { provider: { isActive: true }, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] } }),
      prisma.provider.count({ where: { isActive: true } }),
    ]);
    stats = { deals, providers };
  } catch {
    // Category browsing remains available without database counters.
  }
  return <HeroSection stats={stats} />;
}
