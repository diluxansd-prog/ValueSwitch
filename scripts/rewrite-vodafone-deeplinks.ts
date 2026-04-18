/**
 * One-shot: rewrite every Vodafone plan whose merchantDeepLink points at
 * the retired /web-shop/deeplink endpoint → re-route to /basket, then
 * regenerate the affiliateUrl cread wrapper.
 *
 * Safe to run repeatedly — URLs already in /basket format are untouched.
 *
 * Run:  DATABASE_URL=... npx tsx scripts/rewrite-vodafone-deeplinks.ts
 */
import { PrismaClient } from "@prisma/client";
import { generateAwinLink, AWIN_MERCHANTS } from "../src/lib/affiliate";

const prisma = new PrismaClient();

function rewriteVodafoneUrl(url: string | null): string | null {
  if (!url || !url.startsWith("http")) return null;
  try {
    const u = new URL(url);
    if (u.hostname !== "www.vodafone.co.uk") return url;
    if (u.pathname === "/web-shop/deeplink") {
      const hsku = u.searchParams.get("handsetSkuId");
      const psku = u.searchParams.get("planSkuId");
      if (hsku && psku) {
        return `https://www.vodafone.co.uk/basket?planSkuId=${psku}&deviceSkuId=${hsku}`;
      }
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

async function main() {
  const vf = await prisma.provider.findUnique({ where: { slug: "vodafone" } });
  if (!vf) throw new Error("Vodafone provider not found");

  const plans = await prisma.plan.findMany({
    where: { providerId: vf.id },
    select: {
      id: true,
      name: true,
      handsetModel: true,
      includesHandset: true,
      subcategory: true,
      merchantDeepLink: true,
    },
  });

  let rewritten = 0;
  let unchanged = 0;
  let fallback = 0;

  for (const p of plans) {
    const newDeep = rewriteVodafoneUrl(p.merchantDeepLink);
    const isSim =
      !p.includesHandset &&
      (p.subcategory === "sim-only" || !p.handsetModel);
    const fallbackUrl = isSim
      ? "https://www.vodafone.co.uk/mobile/best-sim-only-deals"
      : "https://www.vodafone.co.uk/mobile/phones";
    const destination = newDeep || fallbackUrl;
    const brand = p.handsetModel?.toLowerCase() || "other";
    const clickref = isSim
      ? "deal_simonly_vodafone"
      : `deal_${brand}_vodafone`;

    const affiliateUrl = generateAwinLink({
      merchantId: AWIN_MERCHANTS.vodafone,
      destinationUrl: destination,
      clickref,
    });

    await prisma.plan.update({
      where: { id: p.id },
      data: {
        affiliateUrl,
        merchantDeepLink: newDeep,
      },
    });

    if (!newDeep) fallback++;
    else if (newDeep === p.merchantDeepLink) unchanged++;
    else rewritten++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ${rewritten} URLs rewritten  (/web-shop/deeplink → /basket)`);
  console.log(`   ${unchanged} URLs already in /basket format (unchanged)`);
  console.log(`   ${fallback} plans fell back to landing page (no valid deep link)`);
  console.log(`   ${plans.length} plans total`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
