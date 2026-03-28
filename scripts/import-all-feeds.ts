/**
 * Import ALL merchant feeds from the combined Awin data feed.
 * Handles: TalkMobile (2351), TTFone (28737), Lebara (30681), Vodafone (1257)
 *
 * This feed has only 21 columns (no Telcos:* fields).
 * Monthly price & specs must be parsed from product_name/description.
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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 120);
}

function extractMonthlyPrice(text: string): number | null {
  // Match patterns like "£13.95 a month", "£16 a month"
  const match = text.match(/£([\d.]+)\s*a\s*month/i);
  if (match) return parseFloat(match[1]);
  // Match "£38.50/mo" or "£10.00/mo"
  const match2 = text.match(/£([\d.]+)\s*\/mo/i);
  if (match2) return parseFloat(match2[1]);
  return null;
}

function extractData(text: string): string | null {
  // "200GB of 5G data", "Unlimited 5G data", "100GB"
  const match = text.match(/(Unlimited|\d+(?:\.\d+)?)\s*(?:GB|MB)?\s*(?:of\s+)?(?:5G\s+|4G\s+)?data/i);
  if (match) {
    if (match[1].toLowerCase() === "unlimited") return "Unlimited";
    return match[1] + "GB";
  }
  // Just "100GB" in product name (Lebara style)
  const match2 = text.match(/(\d+)\s*GB/i);
  if (match2) return match2[1] + "GB";
  return null;
}

function extractMinutes(text: string): string | null {
  const match = text.match(/(Unlimited)\s*mins?/i);
  if (match) return "Unlimited";
  const match2 = text.match(/(\d+)\s*mins?/i);
  if (match2) return match2[1];
  return null;
}

function extractTexts(text: string): string | null {
  const match = text.match(/(Unlimited)\s*texts?/i);
  if (match) return "Unlimited";
  const match2 = text.match(/(\d+)\s*texts?/i);
  if (match2) return match2[1];
  return null;
}

function extractContractLength(text: string): number | null {
  const match = text.match(/(\d+)\s*[Mm]onth\s*(?:contract|plan)/i);
  if (match) return parseInt(match[1]);
  if (/1 Month contract/i.test(text)) return 1;
  if (/12 Month/i.test(text)) return 12;
  if (/24 Month/i.test(text)) return 24;
  if (/36 Month/i.test(text)) return 36;
  return null;
}

interface FeedRecord {
  aw_deep_link: string;
  product_name: string;
  merchant_product_id: string;
  merchant_image_url: string;
  description: string;
  merchant_category: string;
  search_price: string;
  merchant_name: string;
  merchant_id: string;
  aw_image_url: string;
  merchant_deep_link: string;
  display_price: string;
  [key: string]: string;
}

const MERCHANT_MAP: Record<string, { slug: string; awinMid: string }> = {
  "2351":  { slug: "talkmobile", awinMid: "2351" },
  "28737": { slug: "ttfone",     awinMid: "28737" },
  "30681": { slug: "lebara",     awinMid: "30681" },
  "1257":  { slug: "vodafone",   awinMid: "1257" },
};

async function main() {
  console.log("🚀 Importing ALL merchant feeds...\n");

  // Also load Vodafone-specific feed for better data (has Telcos:* fields)
  const vodafoneHeaders: string[] = [];
  const vodafoneRecords = new Map<string, Record<string, string>>();

  const vodaFeedPath = "C:/Users/Diluxsan/OneDrive/Desktop/datafeed_2798806.csv.gz";
  if (fs.existsSync(vodaFeedPath)) {
    const vgz = fs.readFileSync(vodaFeedPath);
    const vcsv = zlib.gunzipSync(vgz).toString("utf-8");
    const vlines = vcsv.split("\n");
    const vh = parseCSVLine(vlines[0]);
    vodafoneHeaders.push(...vh);
    for (let i = 1; i < vlines.length; i++) {
      if (!vlines[i]?.trim()) continue;
      const vals = parseCSVLine(vlines[i]);
      const obj: Record<string, string> = {};
      vh.forEach((h, idx) => (obj[h] = vals[idx] || ""));
      if (obj.merchant_product_id) {
        vodafoneRecords.set(obj.merchant_product_id, obj);
      }
    }
    console.log(`📂 Loaded ${vodafoneRecords.size} Vodafone records from detailed feed`);
  }

  // Load combined feed
  const feedPath = "C:/Users/Diluxsan/OneDrive/Desktop/datafeed_2798806 (3).csv.gz";
  const gz = fs.readFileSync(feedPath);
  const csv = zlib.gunzipSync(gz).toString("utf-8");
  const lines = csv.split("\n");
  const headers = parseCSVLine(lines[0]);

  const allRecords: FeedRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]?.trim()) continue;
    const vals = parseCSVLine(lines[i]);
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => (obj[h] = vals[idx] || ""));
    allRecords.push(obj as FeedRecord);
  }
  console.log(`📂 Total records in combined feed: ${allRecords.length}\n`);

  // Group by merchant
  const byMerchant = new Map<string, FeedRecord[]>();
  for (const rec of allRecords) {
    const mid = rec.merchant_id;
    if (!MERCHANT_MAP[mid]) continue;
    if (!byMerchant.has(mid)) byMerchant.set(mid, []);
    byMerchant.get(mid)!.push(rec);
  }

  for (const [mid, records] of byMerchant) {
    const config = MERCHANT_MAP[mid];
    const merchantName = records[0]?.merchant_name || config.slug;
    console.log(`\n═══ ${merchantName} (${records.length} records) ═══`);

    const provider = await p.provider.findUnique({ where: { slug: config.slug } });
    if (!provider) { console.log("  ⚠️ Provider not found, skipping"); continue; }

    // Delete existing plans
    const deleted = await p.plan.deleteMany({ where: { providerId: provider.id } });
    if (deleted.count > 0) console.log(`  Removed ${deleted.count} existing plans`);

    // Deduplicate
    const seen = new Map<string, FeedRecord>();
    for (const rec of records) {
      const key = rec.merchant_product_id;
      if (!key) continue;
      if (!seen.has(key)) seen.set(key, rec);
    }
    console.log(`  Unique deals: ${seen.size}`);

    let toImport = [...seen.values()];

    // For Vodafone, use the detailed feed instead
    if (mid === "1257" && vodafoneRecords.size > 0) {
      console.log(`  Using detailed Vodafone feed (${vodafoneRecords.size} records)`);
      // Group by brand/storage and pick top 3 per model
      const byModel = new Map<string, Record<string, string>[]>();
      for (const [, rec] of vodafoneRecords) {
        const model = (rec.brand_name || "Unknown") + " " + (rec["Telcos:storage_size"] || "");
        if (!byModel.has(model)) byModel.set(model, []);
        byModel.get(model)!.push(rec);
      }
      const vodaImport: Record<string, string>[] = [];
      for (const [, recs] of byModel) {
        recs.sort((a, b) => {
          const am = parseFloat(a["Telcos:month_cost"]) || 999;
          const bm = parseFloat(b["Telcos:month_cost"]) || 999;
          return am - bm;
        });
        vodaImport.push(...recs.slice(0, 3));
      }
      // Cap at 80
      vodaImport.sort((a, b) => {
        const am = parseFloat(a["Telcos:month_cost"]) || 999;
        const bm = parseFloat(b["Telcos:month_cost"]) || 999;
        return am - bm;
      });
      const capped = vodaImport.slice(0, 80);
      console.log(`  Selected ${capped.length} Vodafone deals`);

      let imported = 0;
      for (const rec of capped) {
        try {
          const monthCost = parseFloat(rec["Telcos:month_cost"]) || 0;
          if (monthCost <= 0) continue;
          const term = parseInt(rec["Telcos:term"]) || null;
          const setupFee = parseFloat(rec["Telcos:initial_cost"]) || 0;
          const annualCost = term ? monthCost * term + setupFee : monthCost * 12;

          let dataAllowance = rec["Telcos:inc_data"] || null;
          if (dataAllowance?.match(/^\d+$/)) {
            const num = parseInt(dataAllowance);
            dataAllowance = num >= 1000 ? (num / 1000) + "GB" : num + "MB";
          }

          const productName = rec.product_name
            .replace(/\s*at\s*£[\d.]+\s*on\s*/i, " on ")
            .replace(/\([^)]*contract\)/i, "")
            .replace(/with\s+Unlimited.*/i, "")
            .trim().substring(0, 120);
          const planName = `${productName} - £${monthCost.toFixed(2)}/mo${term ? ` (${term}mo)` : ""}`;
          const slug = slugify(planName + "-" + rec.merchant_product_id?.slice(-6));

          let affiliateUrl = rec.aw_deep_link;
          if (rec.merchant_deep_link) {
            affiliateUrl = `https://www.awin1.com/cread.php?awinmid=${config.awinMid}&awinaffid=2798806&ued=${encodeURIComponent(rec.merchant_deep_link)}`;
          }
          const imageUrl = rec.merchant_image_url?.includes("noimage") ? null : (rec.merchant_image_url || null);

          await p.plan.create({
            data: {
              name: planName, slug, category: "mobile",
              subcategory: rec["Telcos:contract_type"]?.toLowerCase().includes("sim") ? "sim-only" : "contracts",
              description: rec.description?.substring(0, 500) || null,
              monthlyCost: monthCost, annualCost, setupFee, contractLength: term,
              dataAllowance,
              minutes: rec["Telcos:inc_minutes"] || null,
              texts: rec["Telcos:inc_texts"] || null,
              networkType: rec["Telcos:connectivity"] || null,
              includesHandset: !rec["Telcos:contract_type"]?.toLowerCase().includes("sim"),
              handsetModel: rec.brand_name || null,
              affiliateUrl, merchantProductId: rec.merchant_product_id,
              imageUrl, providerId: provider.id,
              features: JSON.stringify([
                dataAllowance ? `${dataAllowance} data` : null,
                rec["Telcos:inc_minutes"] ? `${rec["Telcos:inc_minutes"]} minutes` : null,
                rec["Telcos:inc_texts"] ? `${rec["Telcos:inc_texts"]} texts` : null,
                term ? `${term} month contract` : "Rolling monthly",
              ].filter(Boolean)),
            },
          });
          imported++;
        } catch (err: any) { if (err?.code !== "P2002") console.error("  !", err.message); }
      }
      console.log(`  ✅ Imported ${imported} Vodafone plans`);
    } else {
      // TalkMobile, TTFone, Lebara — parse from product_name/description
      let imported = 0;
      for (const rec of toImport) {
        try {
          const fullText = rec.product_name + " " + (rec.description || "");
          const searchPrice = parseFloat(rec.search_price) || 0;

          // Extract monthly price from product_name, fallback to search_price
          let monthCost = extractMonthlyPrice(rec.product_name) || searchPrice;

          // For TTFone, search_price is the product price (one-time), not monthly
          if (mid === "28737") {
            // TTFone sells physical phones, not contracts
            monthCost = searchPrice; // This is the phone price
          }

          if (monthCost <= 0) continue;

          const dataAllowance = extractData(fullText);
          const minutes = extractMinutes(fullText);
          const texts = extractTexts(fullText);
          const contractLength = extractContractLength(fullText);

          const isSim = rec.merchant_category?.toLowerCase().includes("sim") ||
                        rec.product_name?.toLowerCase().includes("sim only") ||
                        rec.product_name?.toLowerCase().includes("sim card");

          // Clean product name
          let cleanName = rec.product_name
            .replace(/\(Consumer.*?\)/gi, "")
            .replace(/\(Affiliate.*?\)/gi, "")
            .trim();
          if (cleanName.length > 100) cleanName = cleanName.substring(0, 100);

          const planName = mid === "28737"
            ? cleanName  // TTFone: just product name
            : `${cleanName} - £${monthCost.toFixed(2)}/mo`;
          const slug = slugify(planName + "-" + rec.merchant_product_id?.slice(-6));

          let affiliateUrl = rec.aw_deep_link;
          if (rec.merchant_deep_link) {
            affiliateUrl = `https://www.awin1.com/cread.php?awinmid=${config.awinMid}&awinaffid=2798806&ued=${encodeURIComponent(rec.merchant_deep_link)}`;
          }
          const rawImage = rec.merchant_image_url || rec.aw_image_url || null;
          const imageUrl = rawImage?.includes("noimage") ? null : rawImage;

          const annualCost = contractLength && contractLength > 1
            ? monthCost * contractLength
            : monthCost * 12;

          await p.plan.create({
            data: {
              name: planName, slug, category: "mobile",
              subcategory: isSim ? "sim-only" : "contracts",
              description: rec.description?.substring(0, 500) || null,
              monthlyCost: monthCost, annualCost, setupFee: 0,
              contractLength: contractLength || (mid === "28737" ? null : 1),
              dataAllowance, minutes, texts,
              networkType: fullText.includes("5G") ? "5G" : fullText.includes("4G") ? "4G" : null,
              includesHandset: !isSim && mid !== "28737",
              handsetModel: null,
              affiliateUrl, merchantProductId: rec.merchant_product_id,
              imageUrl, providerId: provider.id,
              features: JSON.stringify([
                dataAllowance ? `${dataAllowance} data` : null,
                minutes ? `${minutes} minutes` : null,
                texts ? `${texts} texts` : null,
                contractLength ? `${contractLength} month contract` : mid === "28737" ? null : "Rolling monthly",
              ].filter(Boolean)),
            },
          });
          imported++;
        } catch (err: any) { if (err?.code !== "P2002") console.error("  !", err.message); }
      }
      console.log(`  ✅ Imported ${imported} plans`);
    }

    // Mark best value
    const cheapest = await p.plan.findFirst({
      where: { providerId: provider.id },
      orderBy: { monthlyCost: "asc" },
    });
    if (cheapest) {
      await p.plan.update({ where: { id: cheapest.id }, data: { isBestValue: true } });
      console.log(`  ⭐ Best value: ${cheapest.name} - £${cheapest.monthlyCost}/mo`);
    }

    // Activate provider
    await p.provider.update({ where: { id: provider.id }, data: { isActive: true } });
    console.log(`  ✅ Provider activated`);
  }

  // Final summary
  console.log("\n═══════════════════════════════════════════");
  const byProv = await p.plan.groupBy({ by: ["providerId"], _count: true });
  for (const g of byProv) {
    const prov = await p.provider.findUnique({ where: { id: g.providerId }, select: { name: true } });
    console.log(`  ${prov?.name}: ${g._count} plans`);
  }
  const totalPlans = await p.plan.count();
  const activeProv = await p.provider.count({ where: { isActive: true } });
  console.log(`\n📊 Total plans: ${totalPlans} | Active providers: ${activeProv}`);
  console.log("═══════════════════════════════════════════");
}

main().catch(console.error).finally(() => p.$disconnect());
