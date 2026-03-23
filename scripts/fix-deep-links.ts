/**
 * Fix Vodafone affiliate links to point to exact product pages.
 *
 * Uses Awin cread format with URL-encoded merchant_deep_link:
 * https://www.awin1.com/cread.php?awinmid=1257&awinaffid=2798806&ued=<encoded_vodafone_url>
 *
 * This ensures:
 * 1. User lands on the EXACT deal on Vodafone's site
 * 2. Awin tracks the click for commission
 */
import fs from "fs";
import zlib from "zlib";
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') inQuotes = !inQuotes;
    else if (ch === "," && !inQuotes) { result.push(current.trim()); current = ""; }
    else current += ch;
  }
  result.push(current.trim());
  return result;
}

async function main() {
  console.log("🔗 Fixing Vodafone deep links to match exact products...\n");

  // Parse the feed to get merchant_deep_link for each product
  const gz = fs.readFileSync("C:/Users/Diluxsan/OneDrive/Desktop/datafeed_2798806.csv.gz");
  const csv = zlib.gunzipSync(gz).toString("utf-8");
  const lines = csv.split("\n");
  const headers = parseCSVLine(lines[0]);

  // Build a map: merchant_product_id -> merchant_deep_link
  const deepLinkMap = new Map<string, string>();
  const productNameMap = new Map<string, string>();

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]?.trim()) continue;
    const vals = parseCSVLine(lines[i]);
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => (obj[h] = vals[idx] || ""));

    const merchantId = obj.merchant_product_id;
    const merchantDeepLink = obj.merchant_deep_link;

    if (merchantId && merchantDeepLink) {
      deepLinkMap.set(merchantId, merchantDeepLink);
      productNameMap.set(merchantId, obj.product_name?.substring(0, 80) || "");
    }
  }

  console.log(`📂 Loaded ${deepLinkMap.size} product deep links from feed\n`);

  // Get all Vodafone plans from DB
  const vodafone = await p.provider.findUnique({ where: { slug: "vodafone" } });
  if (!vodafone) { console.log("No Vodafone provider"); return; }

  const plans = await p.plan.findMany({
    where: { providerId: vodafone.id },
    select: { id: true, name: true, merchantProductId: true },
  });

  let matched = 0;
  let unmatched = 0;
  const generalLink = "https://www.awin1.com/cread.php?awinmid=1257&awinaffid=2798806&ued=https%3A%2F%2Fwww.vodafone.co.uk%2Fmobile%2Fbest-sim-only-deals";

  for (const plan of plans) {
    let affiliateUrl = generalLink; // fallback

    if (plan.merchantProductId && deepLinkMap.has(plan.merchantProductId)) {
      // Build proper Awin cread link with the exact Vodafone deep link
      const vodafoneUrl = deepLinkMap.get(plan.merchantProductId)!;
      const encodedUrl = encodeURIComponent(vodafoneUrl);
      affiliateUrl = `https://www.awin1.com/cread.php?awinmid=1257&awinaffid=2798806&ued=${encodedUrl}`;
      matched++;
    } else {
      unmatched++;
    }

    await p.plan.update({
      where: { id: plan.id },
      data: { affiliateUrl },
    });
  }

  console.log(`✅ Updated ${plans.length} plans:`);
  console.log(`   ${matched} matched to exact product page`);
  console.log(`   ${unmatched} using general Vodafone link (fallback)`);

  // Show a few examples
  const examples = await p.plan.findMany({
    where: { providerId: vodafone.id, merchantProductId: { not: null } },
    select: { name: true, affiliateUrl: true },
    take: 3,
  });
  console.log("\n📋 Examples:");
  for (const ex of examples) {
    console.log(`   ${ex.name.substring(0, 60)}...`);
    console.log(`   → ${ex.affiliateUrl?.substring(0, 120)}...`);
  }
}

main().catch(console.error).finally(() => p.$disconnect());
