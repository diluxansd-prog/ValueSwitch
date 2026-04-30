/**
 * Import every active mobile merchant in one go from the combined feed.
 * Downloads the CSV ONCE, then dispatches per-merchant imports against the
 * cached buffer.  Mirrors what the Vercel cron does when
 * AWIN_COMBINED_FEED_URL is set.
 */
import zlib from "zlib";
import { MERCHANT_FEEDS } from "../src/config/merchants";
import { importFromCsv } from "../src/lib/feed-importer";
import { pingIndexNow } from "../src/lib/indexnow";

const FEED_URL =
  "https://productdata.awin.com/datafeed/download/apikey/5c27ad9115ddc76c827c2a5fdd2f8271/language/en/fid/11645,24085,48719,50529,58891,58895,74135,81201,85492,87119,89798,89799,90619,92181,94188,94713,95085,95364,95492,96076,97090,97136,97224,101247,101882,109667,114660,114910/rid/0/hasEnhancedFeeds/0/columns/aw_deep_link,product_name,aw_product_id,merchant_product_id,merchant_image_url,description,merchant_category,search_price,merchant_name,merchant_id,category_name,category_id,aw_image_url,currency,store_price,delivery_cost,merchant_deep_link,language,last_updated,display_price,data_feed_id/format/csv/delimiter/%2C/compression/gzip/adultcontent/1/";

async function main() {
  console.log("⬇️  Downloading combined feed...");
  const res = await fetch(FEED_URL);
  const ab = await res.arrayBuffer();
  const buf = Buffer.from(ab);
  const csv = zlib.gunzipSync(buf).toString("utf-8");
  console.log(`✓ Downloaded ${(buf.length / 1024 / 1024).toFixed(2)} MB\n`);

  const targets = MERCHANT_FEEDS.filter((m) => !m.cronSkip);
  console.log(`Importing ${targets.length} merchants:\n`);

  const results = [];
  const newUrls: string[] = [];
  for (const m of targets) {
    process.stdout.write(`  ${m.slug.padEnd(15)} `);
    const r = await importFromCsv(m, csv, "combined-feed");
    if (r.ok) {
      console.log(
        `+${r.counts.created} new, ~${r.counts.updated} updated, ${r.counts.priceChanges} price changes`
      );
    } else {
      console.log(`❌ ${r.error}`);
    }
    results.push({ slug: m.slug, ...r.counts });
    if (r.newDealUrls) newUrls.push(...r.newDealUrls);
  }

  // Ping IndexNow with all new URLs in one batch
  if (newUrls.length > 0) {
    console.log(`\n📡 Pinging IndexNow with ${newUrls.length} new URLs...`);
    await pingIndexNow(newUrls).catch(() => null);
  }

  // Summary table
  console.log("\n" + "=".repeat(70));
  console.log(
    "merchant".padEnd(16) +
      "rows".padStart(8) +
      "deals".padStart(8) +
      "created".padStart(10) +
      "updated".padStart(10) +
      "errors".padStart(9)
  );
  console.log("-".repeat(70));
  let totalCreated = 0;
  let totalUpdated = 0;
  for (const r of results) {
    console.log(
      r.slug.padEnd(16) +
        String(r.totalRows).padStart(8) +
        String(r.uniqueDeals).padStart(8) +
        String(r.created).padStart(10) +
        String(r.updated).padStart(10) +
        String(r.errors).padStart(9)
    );
    totalCreated += r.created;
    totalUpdated += r.updated;
  }
  console.log("-".repeat(70));
  console.log(`Total: ${totalCreated} created, ${totalUpdated} updated`);
}

main().catch(console.error);
