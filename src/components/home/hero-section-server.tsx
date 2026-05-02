import { prisma } from "@/lib/prisma";
import { HeroSection } from "./hero-section";

/**
 * Server wrapper that fetches live counters and passes them into the
 * client hero. Defensive — if the DB is unreachable at build time we
 * fall back to safe baseline numbers.
 */
export async function HeroSectionServer() {
  try {
    const [deals, providers, cheapestAgg] = await Promise.all([
      prisma.plan.count(),
      prisma.provider.count({ where: { isActive: true } }),
      prisma.plan.aggregate({ _min: { monthlyCost: true } }),
    ]);
    return (
      <HeroSection
        stats={{
          deals,
          providers,
          cheapestMonthly: cheapestAgg._min.monthlyCost ?? 4.5,
        }}
      />
    );
  } catch {
    return <HeroSection />;
  }
}
