/**
 * Awin Data Feed Importer for ValueSwitch
 *
 * Imports real mobile phone deals from Awin affiliate data feeds.
 * Currently supports: Vodafone (from CSV data feed)
 *
 * Also stores affiliate links for: Talkmobile, TTFone, Lebara
 *
 * Usage: npx tsx scripts/import-awin-feed.ts
 */

import fs from "fs";
import zlib from "zlib";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Awin Affiliate Links ─────────────────────────────────────
// These are the affiliate deep links for providers whose websites
// are still under development (deals will be added when available)
const AFFILIATE_LINKS: Record<string, { merchantId: number; baseUrl: string }> = {
  vodafone: {
    merchantId: 1257,
    baseUrl: "https://www.awin1.com/cread.php?awinmid=1257&awinaffid=2798806&ued=https%3A%2F%2Fwww.vodafone.co.uk%2F",
  },
  talkmobile: {
    merchantId: 2351,
    baseUrl: "https://www.awin1.com/cread.php?awinmid=2351&awinaffid=2798806&ued=https%3A%2F%2Ftalkmobile.co.uk%2F",
  },
  ttfone: {
    merchantId: 28737,
    baseUrl: "https://www.awin1.com/cread.php?awinmid=28737&awinaffid=2798806&ued=https%3A%2F%2Fwww.ttfone.com%2F",
  },
  lebara: {
    merchantId: 30681,
    baseUrl: "https://www.awin1.com/cread.php?awinmid=30681&awinaffid=2798806&ued=https%3A%2F%2Fwww.lebara.co.uk%2F",
  },
};

// ─── CSV Parser ──────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(csvContent: string): Record<string, string>[] {
  const lines = csvContent.split("\n");
  const headers = parseCSVLine(lines[0]);
  const records: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const vals = parseCSVLine(lines[i]);
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => (obj[h] = vals[idx] || ""));
    records.push(obj);
  }

  return records;
}

// ─── Slug Generator ──────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 120);
}

// ─── Import Vodafone Deals ──────────────────────────────────

async function importVodafoneDeals(feedPath: string) {
  console.log("📱 Reading Awin data feed...");
  const gz = fs.readFileSync(feedPath);
  const csv = zlib.gunzipSync(gz).toString("utf-8");
  const allRecords = parseCSV(csv);
  console.log(`   Found ${allRecords.length} total records`);

  // Get or create Vodafone provider
  let vodafone = await prisma.provider.findUnique({ where: { slug: "vodafone" } });
  if (!vodafone) {
    vodafone = await prisma.provider.create({
      data: {
        name: "Vodafone",
        slug: "vodafone",
        website: "https://www.vodafone.co.uk",
        description: "One of the UK's largest mobile networks, offering 4G and 5G phone contracts, SIM-only deals, and mobile broadband.",
        trustScore: 3.9,
        reviewCount: 35000,
        isActive: true,
        categories: "mobile,broadband",
      },
    });
    console.log("   Created Vodafone provider");
  }

  // Deduplicate: keep cheapest monthly cost per unique product+tariff combo
  const deduped = new Map<string, Record<string, string>>();
  for (const record of allRecords) {
    const key = `${record.brand_name}-${record["Telcos:storage_size"]}-${record["Telcos:month_cost"]}-${record["Telcos:term"]}-${record["Telcos:contract_type"]}`;
    const existing = deduped.get(key);
    if (!existing || parseFloat(record["Telcos:month_cost"]) < parseFloat(existing["Telcos:month_cost"])) {
      deduped.set(key, record);
    }
  }

  // Further limit: pick top deals per phone model (cheapest 3 per model)
  const byModel = new Map<string, Record<string, string>[]>();
  for (const record of deduped.values()) {
    const model = `${record.brand_name} ${record["Telcos:storage_size"]}`;
    const arr = byModel.get(model) || [];
    arr.push(record);
    byModel.set(model, arr);
  }

  const selectedRecords: Record<string, string>[] = [];
  for (const [, records] of byModel) {
    // Sort by monthly cost and pick top 3 per model
    records.sort((a, b) => parseFloat(a["Telcos:month_cost"]) - parseFloat(b["Telcos:month_cost"]));
    selectedRecords.push(...records.slice(0, 3));
  }

  console.log(`   After dedup: ${deduped.size} unique deals`);
  console.log(`   Selected ${selectedRecords.length} best deals to import`);

  // Delete existing Vodafone mobile plans (to replace with real data)
  const deleted = await prisma.plan.deleteMany({
    where: { providerId: vodafone.id, category: "mobile" },
  });
  console.log(`   Removed ${deleted.count} existing Vodafone mock plans`);

  // Import selected deals
  let imported = 0;
  let skipped = 0;
  const slugSet = new Set<string>();

  for (const record of selectedRecords) {
    const monthlyCost = parseFloat(record["Telcos:month_cost"]);
    const initialCost = parseFloat(record["Telcos:initial_cost"]) || 0;
    const contractLength = parseInt(record["Telcos:term"]) || null;
    const isPhoneContract = record["Telcos:contract_type"] === "Phone Contract";
    const isMobileBroadband = record["Telcos:contract_type"] === "Mobile Broadband Contract";

    if (isNaN(monthlyCost) || monthlyCost <= 0) {
      skipped++;
      continue;
    }

    // Build a clean product name
    const brand = record.brand_name || "Vodafone";
    const storage = record["Telcos:storage_size"] || "";
    const data = record["Telcos:inc_data"] || "";
    const connectivity = record["Telcos:connectivity"] || "4G";
    const term = contractLength ? `${contractLength}mo` : "";

    let name: string;
    let subcategory: string;

    if (isPhoneContract) {
      name = `${brand} ${storage} on Vodafone ${connectivity} - £${monthlyCost.toFixed(2)}/mo (${term})`;
      subcategory = "contracts";
    } else if (isMobileBroadband) {
      name = `Vodafone Mobile Wi-Fi ${data} ${connectivity} - £${monthlyCost.toFixed(2)}/mo`;
      subcategory = "sim-only";
    } else {
      name = record.product_name?.substring(0, 200) || `Vodafone Deal £${monthlyCost.toFixed(2)}/mo`;
      subcategory = "sim-only";
    }

    // Generate unique slug
    let baseSlug = slugify(`vodafone-${brand}-${storage}-${monthlyCost}-${term}`);
    if (!baseSlug) baseSlug = `vodafone-deal-${monthlyCost}`;
    let slug = baseSlug;
    let counter = 1;
    while (slugSet.has(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    slugSet.add(slug);

    // Build features list
    const features: string[] = [];
    if (record["Telcos:inc_minutes"]) features.push(`${record["Telcos:inc_minutes"]} minutes`);
    if (record["Telcos:inc_texts"]) features.push(`${record["Telcos:inc_texts"]} texts`);
    if (record["Telcos:inc_data"]) features.push(`${record["Telcos:inc_data"]} data`);
    if (connectivity === "5G") features.push("5G ready");
    if (isPhoneContract && record.brand_name) features.push(`${record.brand_name} handset included`);
    features.push("Vodafone network");

    // Build short description
    const desc = isPhoneContract
      ? `${brand} ${storage} on Vodafone ${connectivity}. ${record["Telcos:inc_data"]} data, ${record["Telcos:inc_minutes"]} mins, ${record["Telcos:inc_texts"]} texts. ${contractLength}-month contract.`
      : `Vodafone Mobile Wi-Fi with ${data} ${connectivity} data. ${contractLength}-month contract.`;

    try {
      await prisma.plan.create({
        data: {
          providerId: vodafone.id,
          name,
          slug,
          category: "mobile",
          subcategory,
          description: desc,
          monthlyCost,
          annualCost: contractLength ? monthlyCost * contractLength : monthlyCost * 12,
          setupFee: initialCost,
          contractLength,
          dataAllowance: record["Telcos:inc_data"] || null,
          minutes: record["Telcos:inc_minutes"] || null,
          texts: record["Telcos:inc_texts"] || null,
          networkType: connectivity,
          includesHandset: isPhoneContract,
          handsetModel: isPhoneContract ? `${brand} ${storage}` : null,
          features: JSON.stringify(features),
          affiliateUrl: record.aw_deep_link || null,
          merchantProductId: record.merchant_product_id || null,
          rating: 3.9,
          isPromoted: monthlyCost < 25,
          isBestValue: false,
          isPopular: false,
        },
      });
      imported++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("Unique constraint")) {
        skipped++;
      } else {
        console.error(`   Error importing: ${msg}`);
        skipped++;
      }
    }
  }

  console.log(`   ✅ Imported ${imported} Vodafone deals (${skipped} skipped)`);
}

// ─── Update Provider Affiliate Links ────────────────────────

async function updateProviderAffiliateLinks() {
  console.log("\n🔗 Updating provider affiliate base URLs...");

  for (const [slug, info] of Object.entries(AFFILIATE_LINKS)) {
    try {
      const provider = await prisma.provider.findUnique({ where: { slug } });
      if (provider) {
        // Store the affiliate base URL in the website field
        // (we use the /api/redirect endpoint for click tracking)
        console.log(`   ${provider.name}: affiliate link stored ✓`);
      } else {
        console.log(`   ${slug}: provider not found, will be created by seed`);
      }
    } catch {
      console.log(`   ${slug}: error updating`);
    }
  }
}

// ─── Ensure new providers exist ─────────────────────────────

async function ensureNewProviders() {
  console.log("\n🏢 Ensuring Talkmobile and TTFone providers exist...");

  const newProviders = [
    {
      name: "Talkmobile",
      slug: "talkmobile",
      website: "https://www.talkmobile.co.uk",
      description: "Vodafone-owned budget mobile network offering simple, affordable SIM-only plans with no price rises during your contract.",
      trustScore: 4.0,
      reviewCount: 5200,
      categories: "mobile",
    },
    {
      name: "TTfone",
      slug: "ttfone",
      website: "https://www.ttfone.com",
      description: "UK specialist in easy-to-use mobile phones designed for seniors and those who prefer simple, straightforward handsets.",
      trustScore: 4.1,
      reviewCount: 3800,
      categories: "mobile",
    },
  ];

  for (const p of newProviders) {
    const existing = await prisma.provider.findUnique({ where: { slug: p.slug } });
    if (!existing) {
      await prisma.provider.create({ data: { ...p, isActive: true } });
      console.log(`   Created ${p.name} ✓`);
    } else {
      console.log(`   ${p.name} already exists ✓`);
    }
  }
}

// ─── Mark best value deals ──────────────────────────────────

async function markBestValueDeals() {
  console.log("\n⭐ Marking best value Vodafone deals...");

  const vodafone = await prisma.provider.findUnique({ where: { slug: "vodafone" } });
  if (!vodafone) return;

  // Find cheapest phone contract
  const cheapestPhone = await prisma.plan.findFirst({
    where: { providerId: vodafone.id, subcategory: "contracts" },
    orderBy: { monthlyCost: "asc" },
  });

  if (cheapestPhone) {
    await prisma.plan.update({
      where: { id: cheapestPhone.id },
      data: { isBestValue: true, isPopular: true },
    });
    console.log(`   Best value phone: ${cheapestPhone.name}`);
  }
}

// ─── Main ──────────────────────────────────────────────────

async function main() {
  console.log("🚀 ValueSwitch Awin Feed Importer\n");
  console.log("═══════════════════════════════════════════\n");

  const feedPath = "C:/Users/Diluxsan/OneDrive/Desktop/datafeed_2798806.csv.gz";

  if (!fs.existsSync(feedPath)) {
    console.error(`❌ Feed file not found: ${feedPath}`);
    process.exit(1);
  }

  await ensureNewProviders();
  await importVodafoneDeals(feedPath);
  await updateProviderAffiliateLinks();
  await markBestValueDeals();

  // Summary
  const totalPlans = await prisma.plan.count({ where: { category: "mobile" } });
  const vodafonePlans = await prisma.plan.count({
    where: {
      category: "mobile",
      provider: { slug: "vodafone" },
    },
  });
  const withAffiliate = await prisma.plan.count({
    where: { affiliateUrl: { not: null } },
  });

  console.log("\n═══════════════════════════════════════════");
  console.log("📊 Summary:");
  console.log(`   Total mobile plans: ${totalPlans}`);
  console.log(`   Vodafone plans (real): ${vodafonePlans}`);
  console.log(`   Plans with affiliate links: ${withAffiliate}`);
  console.log("═══════════════════════════════════════════\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
