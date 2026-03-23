import fs from "fs";
import zlib from "zlib";

const gz = fs.readFileSync("C:/Users/Diluxsan/OneDrive/Desktop/datafeed_2798806.csv.gz");
const csv = zlib.gunzipSync(gz).toString("utf-8");
const lines = csv.split("\n");

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

const headers = parseCSVLine(lines[0]);
// Show all URL-related fields for first 5 records
const urlFields = headers.filter(h =>
  h.includes("link") || h.includes("url") || h.includes("URL") || h.includes("deep") || h.includes("merchant_deep")
);
console.log("URL fields:", urlFields);

for (let i = 1; i <= 5; i++) {
  if (!lines[i]?.trim()) continue;
  const vals = parseCSVLine(lines[i]);
  const obj: Record<string, string> = {};
  headers.forEach((h, idx) => (obj[h] = vals[idx] || ""));

  console.log(`\n--- Record ${i} ---`);
  console.log("product_name:", obj.product_name?.substring(0, 100));
  console.log("aw_deep_link:", obj.aw_deep_link?.substring(0, 200));
  console.log("merchant_deep_link:", obj.merchant_deep_link?.substring(0, 200));
  console.log("basket_link:", obj.basket_link?.substring(0, 200));
}
