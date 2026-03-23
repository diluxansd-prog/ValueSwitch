import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function main() {
  const cats = await p.plan.groupBy({ by: ["category"], _count: true });
  console.log("Plans by category:", cats);

  const aff = await p.plan.count({ where: { affiliateUrl: { not: null } } });
  console.log("Plans with affiliate URLs:", aff);

  const mock = await p.plan.count({ where: { affiliateUrl: null } });
  console.log("Plans WITHOUT affiliate (MOCK):", mock);

  const providers = await p.provider.findMany({
    select: { id: true, name: true, slug: true, categories: true, isActive: true, _count: { select: { plans: true } } },
    orderBy: { name: "asc" },
  });
  console.log("\nProviders:");
  for (const pr of providers) {
    console.log(`  ${pr.name} (${pr.slug}) - ${pr._count.plans} plans - cats: ${pr.categories} - active: ${pr.isActive}`);
  }

  const guides = await p.guide.count();
  console.log("\nGuides:", guides);
}
main().finally(() => p.$disconnect());
