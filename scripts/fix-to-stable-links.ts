/**
 * Fix affiliate links so users never see "Offer no longer available".
 *
 * Problem: the Awin product feed gives merchant_deep_link URLs with
 * specific handsetSkuId / planSkuId. Vodafone expires these SKUs when
 * a phone/plan combination is discontinued, so the deep link shows
 * "Unfortunately this offer is no longer available".
 *
 * Fix: point each plan to Vodafone's brand page (e.g. /mobile/phones/apple).
 * Those pages ALWAYS show current active offers for that brand. The user
 * sees real, in-stock deals, we still earn commission via Awin cread.
 */
import { PrismaClient } from "@prisma/client";
import { generateAwinLink, AWIN_MERCHANTS } from "../src/lib/affiliate";

const prisma = new PrismaClient();

// Map our handsetModel values → Vodafone's brand landing page slug
// Vodafone URL pattern: https://www.vodafone.co.uk/mobile/phones/<brand>
// where <brand> is the lowercase brand name.
const VODAFONE_BRAND_SLUG: Record<string, string> = {
  apple: "apple",
  samsung: "samsung",
  google: "google",
  honor: "honor",
  motorola: "motorola",
  doro: "doro",
  zte: "zte",
  // "Vodafone" branded handsets (Smart series) — use generic phones page
  vodafone: "",
};

function vodafoneBrandUrl(brand: string | null | undefined): string {
  const slug = brand ? VODAFONE_BRAND_SLUG[brand.toLowerCase()] : undefined;
  if (slug && slug.length > 0) {
    return `https://www.vodafone.co.uk/mobile/phones/${slug}`;
  }
  // Fallback: all phones page
  return "https://www.vodafone.co.uk/mobile/phones";
}

async function main() {
  console.log("🔗 Updating Vodafone deals to stable brand pages...\n");

  const vf = await prisma.provider.findUnique({ where: { slug: "vodafone" } });
  if (!vf) throw new Error("Vodafone provider not found");

  const plans = await prisma.plan.findMany({
    where: { providerId: vf.id },
    select: { id: true, handsetModel: true, name: true },
  });

  let updated = 0;
  const byBrand: Record<string, number> = {};

  for (const plan of plans) {
    const brand = plan.handsetModel || "";
    const destination = vodafoneBrandUrl(brand);
    const affiliateUrl = generateAwinLink({
      merchantId: AWIN_MERCHANTS.vodafone,
      destinationUrl: destination,
      clickref: `deal_${brand.toLowerCase() || "phones"}`,
    });

    await prisma.plan.update({
      where: { id: plan.id },
      data: { affiliateUrl },
    });

    byBrand[brand || "Other"] = (byBrand[brand || "Other"] || 0) + 1;
    updated++;
  }

  console.log(`✅ Updated ${updated} plans`);
  console.log("\n📊 Breakdown by brand:");
  for (const [brand, count] of Object.entries(byBrand).sort(
    ([, a], [, b]) => b - a
  )) {
    const dest = vodafoneBrandUrl(brand);
    console.log(`   ${brand.padEnd(10)} → ${count} plans → ${dest}`);
  }
  console.log("\n💡 All links use the Awin cread format with clickref tracking.");
  console.log("   You'll see 'deal_apple', 'deal_samsung' etc. in Awin reports.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
