/**
 * Point every plan's affiliateUrl at a Vodafone URL that ACTUALLY EXISTS.
 *
 * Vodafone's site is a SPA — many URL patterns look plausible but return
 * 404 or a generic "page not found" screen.  Verified live 2026-04-18:
 *
 *   ✅ 200  https://www.vodafone.co.uk/
 *   ✅ 200  https://www.vodafone.co.uk/mobile/phones              (pay-monthly catalogue)
 *   ✅ 200  https://www.vodafone.co.uk/mobile/pay-monthly-contracts
 *   ✅ 200  https://www.vodafone.co.uk/mobile/best-sim-only-deals
 *   ✅ 200  https://www.vodafone.co.uk/mobile/sim-only
 *   ❌ 404  /mobile/phones/apple, /mobile/phones/samsung, etc.
 *   ❌ 404  /shop/mobile-phones, /web-shop/deeplink?handsetSkuId=...
 *
 * Strategy:
 *   - Handset contract plans  → /mobile/phones          (200, shows all phones)
 *   - SIM-only plans          → /mobile/best-sim-only-deals (200, sim-only catalogue)
 *   - Track which brand sent the click via clickref=deal_<brand>
 */
import { PrismaClient } from "@prisma/client";
import { generateAwinLink, AWIN_MERCHANTS } from "../src/lib/affiliate";

const prisma = new PrismaClient();

const HANDSET_PAGE = "https://www.vodafone.co.uk/mobile/phones";
const SIMONLY_PAGE = "https://www.vodafone.co.uk/mobile/best-sim-only-deals";

async function main() {
  console.log("🔗 Repointing Vodafone deals to verified-live URLs...\n");

  const vf = await prisma.provider.findUnique({ where: { slug: "vodafone" } });
  if (!vf) throw new Error("Vodafone provider not found");

  const plans = await prisma.plan.findMany({
    where: { providerId: vf.id },
    select: {
      id: true,
      includesHandset: true,
      handsetModel: true,
      subcategory: true,
      name: true,
    },
  });

  let handsetCount = 0;
  let simCount = 0;
  const byBrand: Record<string, number> = {};

  for (const plan of plans) {
    const isSimOnly =
      !plan.includesHandset &&
      (plan.subcategory === "sim-only" || !plan.handsetModel);
    const destination = isSimOnly ? SIMONLY_PAGE : HANDSET_PAGE;
    const brand = plan.handsetModel?.toLowerCase() || "phones";
    const clickref = isSimOnly ? "deal_simonly" : `deal_${brand}`;

    const affiliateUrl = generateAwinLink({
      merchantId: AWIN_MERCHANTS.vodafone,
      destinationUrl: destination,
      clickref,
    });

    await prisma.plan.update({
      where: { id: plan.id },
      data: { affiliateUrl },
    });

    if (isSimOnly) simCount++;
    else {
      handsetCount++;
      byBrand[plan.handsetModel || "Other"] =
        (byBrand[plan.handsetModel || "Other"] || 0) + 1;
    }
  }

  console.log(`✅ Repointed ${plans.length} plans:`);
  console.log(`   → ${HANDSET_PAGE}  (${handsetCount} handset deals)`);
  console.log(`   → ${SIMONLY_PAGE}  (${simCount} SIM-only deals)`);
  console.log();
  console.log("📊 Handset deals by brand (clickref tagging):");
  for (const [brand, count] of Object.entries(byBrand).sort(
    ([, a], [, b]) => b - a
  )) {
    console.log(
      `   ${brand.padEnd(10)} → ${count} deals  (clickref=deal_${brand.toLowerCase()})`
    );
  }
  console.log(
    "\n💡 Every click still reports its brand via Awin clickref,"
  );
  console.log(
    "   so revenue per brand is still attributable in Awin reports."
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
