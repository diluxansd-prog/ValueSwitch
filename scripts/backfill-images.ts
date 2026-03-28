/**
 * Backfill product images from the Awin data feed into existing plans.
 * Maps merchant_product_id → merchant_image_url
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
  console.log("🖼️  Backfilling product images from Awin feed...\n");

  const gz = fs.readFileSync("C:/Users/Diluxsan/OneDrive/Desktop/datafeed_2798806.csv.gz");
  const csv = zlib.gunzipSync(gz).toString("utf-8");
  const lines = csv.split("\n");
  const headers = parseCSVLine(lines[0]);

  // Build map: merchant_product_id → image URL
  const imageMap = new Map<string, string>();
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]?.trim()) continue;
    const vals = parseCSVLine(lines[i]);
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => (obj[h] = vals[idx] || ""));

    const id = obj.merchant_product_id;
    const img = obj.merchant_image_url || obj.aw_image_url;
    if (id && img && !imageMap.has(id)) {
      imageMap.set(id, img);
    }
  }
  console.log(`📂 Loaded ${imageMap.size} product images from feed`);

  // Get all plans with merchantProductId
  const plans = await p.plan.findMany({
    where: { merchantProductId: { not: null } },
    select: { id: true, name: true, merchantProductId: true, imageUrl: true },
  });

  let updated = 0;
  for (const plan of plans) {
    if (plan.imageUrl) continue; // already has image
    if (!plan.merchantProductId) continue;

    const img = imageMap.get(plan.merchantProductId);
    if (img) {
      await p.plan.update({
        where: { id: plan.id },
        data: { imageUrl: img },
      });
      updated++;
    }
  }

  console.log(`✅ Updated ${updated} plans with product images`);

  // Show sample
  const samples = await p.plan.findMany({
    where: { imageUrl: { not: null } },
    select: { name: true, imageUrl: true },
    take: 3,
  });
  for (const s of samples) {
    console.log(`  ${s.name.substring(0, 50)} → ${s.imageUrl?.substring(0, 80)}`);
  }
}

main().catch(console.error).finally(() => p.$disconnect());
