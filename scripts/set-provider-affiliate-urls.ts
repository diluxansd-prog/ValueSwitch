/**
 * Set the `affiliateUrl` on each Provider record using the Awin cread format.
 * These are the fallback links used when a plan doesn't have its own
 * product-specific affiliate URL.
 */
import { PrismaClient } from "@prisma/client";
import {
  AWIN_MERCHANTS,
  MERCHANT_HOMEPAGES,
  generateAwinLink,
  type AwinMerchantSlug,
} from "../src/lib/affiliate";

const prisma = new PrismaClient();

async function main() {
  console.log("🔗 Setting provider affiliate URLs (cread format)...\n");

  let updated = 0;
  for (const [slug, merchantId] of Object.entries(AWIN_MERCHANTS) as [
    AwinMerchantSlug,
    string,
  ][]) {
    const destinationUrl = MERCHANT_HOMEPAGES[slug];
    const affiliateUrl = generateAwinLink({
      merchantId,
      destinationUrl,
      clickref: `provider_page_${slug}`,
    });

    const provider = await prisma.provider
      .update({
        where: { slug },
        data: {
          affiliateUrl,
          awinMerchantId: merchantId,
          website: destinationUrl,
        },
      })
      .catch((e: unknown) => {
        console.log(`   ERROR:`, (e as Error).message?.substring(0, 200));
        return null;
      });

    if (provider) {
      console.log(`✅ ${provider.name}`);
      console.log(`   MID: ${merchantId}`);
      console.log(`   → ${affiliateUrl.substring(0, 100)}...`);
      updated++;
    } else {
      console.log(`⚠️  Provider "${slug}" not found in database (skipping)`);
    }
  }

  console.log(`\n📊 Updated ${updated} provider(s)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
