/**
 * One-shot refresh from a LOCAL feed file (not via URL).
 *
 * Use this when you haven't set AWIN_VODAFONE_FEED_URL on Vercel yet
 * but want to immediately re-import with the merchant_deep_link
 * (specific product URLs) from your downloaded feed.
 *
 * Usage:
 *   npx tsx scripts/refresh-from-local-feed.ts
 *
 * Reads from: C:/Users/Diluxsan/OneDrive/Desktop/datafeed_2798806.csv.gz
 */
import fs from "fs";
import path from "path";
import http from "http";

import { MERCHANT_FEEDS } from "../src/config/merchants";
import { importFeed } from "../src/lib/feed-importer";

const LOCAL_FEED_PATH =
  "C:/Users/Diluxsan/OneDrive/Desktop/datafeed_2798806 (3).csv.gz";

async function serveLocalFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const buf = fs.readFileSync(filePath);
    const server = http.createServer((_req, res) => {
      res.writeHead(200, { "Content-Type": "application/gzip" });
      res.end(buf);
    });
    server.listen(0, () => {
      const addr = server.address();
      if (addr && typeof addr === "object") {
        const url = `http://127.0.0.1:${addr.port}/feed.csv.gz`;
        // Keep server alive long enough for the fetch
        setTimeout(() => server.close(), 120_000);
        resolve(url);
      } else {
        reject(new Error("Failed to start local server"));
      }
    });
  });
}

async function main() {
  const absPath = path.resolve(LOCAL_FEED_PATH);
  if (!fs.existsSync(absPath)) {
    console.error(`❌ File not found: ${absPath}`);
    console.error("Update LOCAL_FEED_PATH in this script to match your download.");
    process.exit(1);
  }

  const vodafone = MERCHANT_FEEDS.find((m) => m.slug === "vodafone");
  if (!vodafone) {
    console.error("Vodafone not in MERCHANT_FEEDS registry");
    process.exit(1);
  }

  console.log(`📦 Serving local feed from: ${absPath}`);
  const feedUrl = await serveLocalFile(absPath);
  console.log(`🌐 Local feed URL: ${feedUrl}`);

  const result = await importFeed(vodafone, feedUrl);

  console.log("\n📊 Result:");
  console.log(JSON.stringify(result.counts, null, 2));
  if (!result.ok) console.log("\n❌ Error:", result.error);
  else console.log("\n✅ Done — affiliateUrls now point to specific product pages");

  process.exit(result.ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
