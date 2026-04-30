/**
 * One-shot Fonehouse import via the live Awin feed URL.
 *
 * Run when you don't yet have AWIN_FONEHOUSE_FEED_URL set on Vercel
 * but want to populate the catalogue immediately.
 */
import { MERCHANT_FEEDS } from "../src/config/merchants";
import { importFeed } from "../src/lib/feed-importer";

const FEED_URL =
  "https://productdata.awin.com/datafeed/download/apikey/5c27ad9115ddc76c827c2a5fdd2f8271/language/en/fid/24085,87119/rid/0/hasEnhancedFeeds/0/columns/aw_deep_link,product_name,aw_product_id,merchant_product_id,merchant_image_url,description,merchant_category,search_price,merchant_name,merchant_id,category_name,category_id,aw_image_url,currency,store_price,delivery_cost,merchant_deep_link,language,last_updated,display_price,data_feed_id/format/csv/delimiter/%2C/compression/gzip/adultcontent/1/";

async function main() {
  const fonehouse = MERCHANT_FEEDS.find((m) => m.slug === "fonehouse");
  if (!fonehouse) {
    console.error("Fonehouse not in MERCHANT_FEEDS registry");
    process.exit(1);
  }

  const result = await importFeed(fonehouse, FEED_URL);

  console.log("\n📊 Result:");
  console.log(JSON.stringify(result.counts, null, 2));
  if (!result.ok) console.log("\n❌ Error:", result.error);
  else console.log("\n✅ Done");

  process.exit(result.ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
