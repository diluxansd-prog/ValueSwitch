import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function main() {
  console.log("🔗 Fixing Vodafone affiliate links...\n");

  const vodafone = await p.provider.findUnique({ where: { slug: "vodafone" } });
  if (!vodafone) { console.log("No vodafone provider found"); return; }

  // General Vodafone phones page affiliate link (not product-specific)
  const generalLink = "https://www.awin1.com/cread.php?awinmid=1257&awinaffid=2798806&ued=https%3A%2F%2Fwww.vodafone.co.uk%2Fmobile%2Fbest-sim-only-deals";

  const updated = await p.plan.updateMany({
    where: { providerId: vodafone.id },
    data: { affiliateUrl: generalLink },
  });

  console.log(`✅ Updated ${updated.count} Vodafone deals to general affiliate link`);
  console.log(`   Link: ${generalLink}`);
}

main().catch(console.error).finally(() => p.$disconnect());
