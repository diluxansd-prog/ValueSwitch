import fs from "fs";
import zlib from "zlib";

const gz = fs.readFileSync("C:/Users/Diluxsan/OneDrive/Desktop/datafeed_2798806.csv.gz");
const csv = zlib.gunzipSync(gz).toString("utf-8");
const lines = csv.split("\n");
console.log("Total lines:", lines.length);

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

const headers = parseCSVLine(lines[0]);
console.log("Columns:", headers.length);

// Parse ALL records
const records: Record<string, string>[] = [];
for (let i = 1; i < lines.length; i++) {
  if (!lines[i].trim()) continue;
  const vals = parseCSVLine(lines[i]);
  const obj: Record<string, string> = {};
  headers.forEach((h, idx) => (obj[h] = vals[idx] || ""));
  records.push(obj);
}

console.log("Total records:", records.length);

// Unique merchants
const merchants = [...new Set(records.map((r) => r.merchant_name))];
console.log("Merchants:", merchants);

// Count per merchant
merchants.forEach((m) => {
  console.log(`  ${m}: ${records.filter((r) => r.merchant_name === m).length} deals`);
});

// Show key fields of first 3 records
const keys = [
  "product_name", "merchant_name", "search_price", "brand_name",
  "Telcos:contract_type", "Telcos:term", "Telcos:initial_cost",
  "Telcos:month_cost", "Telcos:inc_minutes", "Telcos:inc_data",
  "Telcos:inc_texts", "Telcos:network", "Telcos:connectivity",
  "Telcos:storage_size", "aw_deep_link", "merchant_image_url",
  "merchant_category", "category_name",
];
for (const r of records.slice(0, 3)) {
  console.log("\n---RECORD---");
  keys.forEach((k) => {
    const v = r[k] || "";
    if (v) console.log(`${k}: ${v.substring(0, 150)}`);
  });
}

// Show unique contract types and categories
console.log("\nContract types:", [...new Set(records.map((r) => r["Telcos:contract_type"]))]);
console.log("Categories:", [...new Set(records.map((r) => r.merchant_category))].slice(0, 20));
console.log("Networks:", [...new Set(records.map((r) => r["Telcos:network"]))]);
console.log("Connectivity:", [...new Set(records.map((r) => r["Telcos:connectivity"]))]);

// Check the second file too
const gz2 = fs.readFileSync("C:/Users/Diluxsan/OneDrive/Desktop/datafeed_2798806 (1).csv.gz");
const csv2 = zlib.gunzipSync(gz2).toString("utf-8");
const lines2 = csv2.split("\n");
console.log("\n\nSecond file lines:", lines2.length);
console.log("Same as first?", csv === csv2 ? "YES (duplicate)" : "NO (different)");
