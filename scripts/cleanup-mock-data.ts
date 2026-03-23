/**
 * Cleanup script: Remove all mock data, keep only real affiliate-linked deals.
 * Deactivate providers without real deals.
 * Only Vodafone has real data right now.
 * Talkmobile, TTFone, Lebara stay active (affiliate links ready, awaiting feeds).
 */
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function main() {
  console.log("🧹 Cleaning up mock data...\n");

  // 1. Delete ALL plans without affiliate links (mock data)
  const deletedPlans = await p.plan.deleteMany({
    where: { affiliateUrl: null },
  });
  console.log(`❌ Deleted ${deletedPlans.count} mock plans`);

  // 2. Also delete Vodafone broadband mock plans (only mobile is real)
  const deletedBB = await p.plan.deleteMany({
    where: { category: { not: "mobile" } },
  });
  console.log(`❌ Deleted ${deletedBB.count} non-mobile plans`);

  // 3. Deactivate providers that have NO real deals and are NOT affiliate partners
  const affiliatePartners = ["vodafone", "talkmobile", "ttfone", "lebara"];

  const allProviders = await p.provider.findMany({
    select: { id: true, slug: true, name: true, _count: { select: { plans: true } } },
  });

  let deactivated = 0;
  for (const pr of allProviders) {
    if (pr._count.plans === 0 && !affiliatePartners.includes(pr.slug)) {
      await p.provider.update({ where: { id: pr.id }, data: { isActive: false } });
      console.log(`   ⏸️  Deactivated: ${pr.name} (0 plans, no affiliate)`);
      deactivated++;
    }
  }
  console.log(`\n⏸️  Deactivated ${deactivated} providers without real data`);

  // 4. Delete all mock guides
  const deletedGuides = await p.guide.deleteMany({});
  console.log(`❌ Deleted ${deletedGuides.count} mock guides`);

  // 5. Clean up comparison history referencing deleted plans
  const deletedCompItems = await p.comparisonItem.deleteMany({});
  const deletedCompHistory = await p.comparisonHistory.deleteMany({});
  console.log(`❌ Deleted ${deletedCompItems.count} comparison items, ${deletedCompHistory.count} comparison histories`);

  // Summary
  const remainingPlans = await p.plan.count();
  const activeProviders = await p.provider.count({ where: { isActive: true } });
  const withAffiliate = await p.plan.count({ where: { affiliateUrl: { not: null } } });

  console.log("\n═══════════════════════════════════════════");
  console.log("📊 Clean database summary:");
  console.log(`   Real plans remaining: ${remainingPlans}`);
  console.log(`   Plans with affiliate links: ${withAffiliate}`);
  console.log(`   Active providers: ${activeProviders}`);
  console.log("═══════════════════════════════════════════\n");
}

main().catch(console.error).finally(() => p.$disconnect());
