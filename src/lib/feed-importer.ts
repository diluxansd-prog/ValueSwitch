/**
 * Awin Product Feed importer.
 *
 * Fetches the latest gzipped CSV from Awin, diffs it against the DB,
 * and applies three side effects:
 *
 *   1. Import new plans (with stable affiliate URLs, never expiring SKUs)
 *   2. Update existing plans if price or metadata changed
 *   3. Snapshot every price change to PriceHistory
 *
 * Designed to be called from:
 *   - The Vercel Cron job (weekly auto-refresh)
 *   - A manual admin "Refresh now" button
 *   - CLI (scripts/refresh-feed.ts)
 *
 * All side effects are idempotent — running twice is safe.
 */
import { prisma } from "@/lib/prisma";
import { gunzipSync } from "zlib";
import { generateAwinLink, AWIN_MERCHANTS } from "@/lib/affiliate";

// Verified-live stable landing pages — see scripts/fix-to-stable-links.ts
const HANDSET_PAGE = "https://www.vodafone.co.uk/mobile/phones";
const SIMONLY_PAGE = "https://www.vodafone.co.uk/mobile/best-sim-only-deals";

export interface FeedImportResult {
  ok: boolean;
  source: string;
  durationMs: number;
  counts: {
    totalRows: number;
    uniqueDeals: number;
    created: number;
    updated: number;
    unchanged: number;
    priceChanges: number;
    errors: number;
  };
  newDealUrls: string[]; // for IndexNow
  error?: string;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      // handle escaped quotes ("")
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result.map((s) => s.trim());
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

async function fetchFeed(
  feedUrl: string
): Promise<{ csv: string; bytes: number }> {
  const res = await fetch(feedUrl, {
    headers: { "User-Agent": "ValueSwitchBot/1.0 (+https://valueswitch.co.uk)" },
  });
  if (!res.ok) {
    throw new Error(`Feed fetch failed: HTTP ${res.status}`);
  }
  const ab = await res.arrayBuffer();
  const gz = Buffer.from(ab);

  let csv: string;
  try {
    // Awin serves gzipped by default
    csv = gunzipSync(gz).toString("utf-8");
  } catch {
    // Fallback: maybe the feed wasn't gzipped
    csv = gz.toString("utf-8");
  }

  return { csv, bytes: gz.length };
}

interface FeedRow {
  merchant_product_id: string;
  product_name: string;
  description: string;
  merchant_name: string;
  merchant_category: string;
  search_price: string; // display price as-is from feed
  merchant_image_url: string;
  "Telcos:contract_type": string;
  "Telcos:term": string; // months
  "Telcos:initial_cost": string; // £ upfront
  "Telcos:month_cost": string; // £/month
  "Telcos:inc_data": string;
  "Telcos:inc_minutes": string;
  "Telcos:inc_texts": string;
  "Telcos:connectivity": string; // 5G / 4G
  "Telcos:network": string;
  "Telcos:storage_size": string;
  "Telcos:tariff": string;
}

function parseFeedToPlans(csv: string): Array<FeedRow & { _uniqKey: string }> {
  const lines = csv.split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const rows: Array<FeedRow & { _uniqKey: string }> = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || !line.trim()) continue;

    const vals = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => (row[h] = vals[idx] || ""));

    if (!row.merchant_product_id) continue;

    // Only import monthly-contract rows, skip outliers
    const monthCost = parseFloat(row["Telcos:month_cost"] || row.search_price);
    if (!isFinite(monthCost) || monthCost <= 0) continue;

    rows.push({
      ...(row as unknown as FeedRow),
      _uniqKey: row.merchant_product_id,
    });
  }

  return rows;
}

/**
 * Reduce 4000+ raw variants into a representative deal per (brand, storage, term).
 * Keeps the cheapest for each combo — avoids spamming users with 50 Samsung S24
 * deals that differ only by upfront cost.
 */
function dedupe(
  rows: Array<FeedRow & { _uniqKey: string }>
): Array<FeedRow & { _uniqKey: string }> {
  type Bucket = { key: string; row: (FeedRow & { _uniqKey: string }); price: number };
  const buckets = new Map<string, Bucket>();

  for (const r of rows) {
    const name = r.product_name || "";
    const brand = (name.match(/^(Apple|Samsung|Google|Huawei|Honor|Motorola|OnePlus|Xiaomi|Sony|Nokia|Doro|ZTE|Vodafone)/i)?.[0] || "Other").toLowerCase();
    const storage = (r["Telcos:storage_size"] || "").replace(/\s+/g, "");
    const term = r["Telcos:term"] || "";
    const price = parseFloat(r["Telcos:month_cost"]);

    const key = `${brand}|${storage}|${term}`;
    const existing = buckets.get(key);
    if (!existing || price < existing.price) {
      buckets.set(key, { key, row: r, price });
    }
  }

  return [...buckets.values()].map((b) => b.row);
}

export async function importFeed(feedUrl: string): Promise<FeedImportResult> {
  const started = Date.now();
  const result: FeedImportResult = {
    ok: false,
    source: feedUrl,
    durationMs: 0,
    counts: {
      totalRows: 0,
      uniqueDeals: 0,
      created: 0,
      updated: 0,
      unchanged: 0,
      priceChanges: 0,
      errors: 0,
    },
    newDealUrls: [],
  };

  try {
    console.log(`[feed-importer] fetching ${feedUrl.substring(0, 80)}...`);
    const { csv, bytes } = await fetchFeed(feedUrl);
    console.log(`[feed-importer] downloaded ${bytes} bytes, parsing...`);

    const rows = parseFeedToPlans(csv);
    result.counts.totalRows = rows.length;

    const deduped = dedupe(rows).slice(0, 200); // safety cap
    result.counts.uniqueDeals = deduped.length;

    const vodafone = await prisma.provider.findUnique({
      where: { slug: "vodafone" },
    });
    if (!vodafone) throw new Error("Vodafone provider not found in DB");

    // Pull current Vodafone plans keyed by merchantProductId for diffing
    const existing = await prisma.plan.findMany({
      where: { providerId: vodafone.id },
      select: {
        id: true,
        merchantProductId: true,
        monthlyCost: true,
      },
    });
    const existingMap = new Map(existing.map((p) => [p.merchantProductId, p]));

    for (const row of deduped) {
      try {
        const monthCost = parseFloat(row["Telcos:month_cost"]);
        const initialCost = parseFloat(row["Telcos:initial_cost"]) || 0;
        const term = parseInt(row["Telcos:term"], 10) || null;
        const isSim =
          /sim[\s-]?only|simo/i.test(row["Telcos:contract_type"]) ||
          /sim[\s-]?only/i.test(row.product_name);

        const destination = isSim ? SIMONLY_PAGE : HANDSET_PAGE;
        const brand =
          (row.product_name || "")
            .match(/^(Apple|Samsung|Google|Huawei|Honor|Motorola|OnePlus|Xiaomi|Sony|Nokia|Doro|ZTE|Vodafone)/i)?.[0] || "Other";
        const clickref = isSim
          ? "deal_simonly"
          : `deal_${brand.toLowerCase()}`;

        const affiliateUrl = generateAwinLink({
          merchantId: AWIN_MERCHANTS.vodafone,
          destinationUrl: destination,
          clickref,
        });

        // Generate a readable plan name/slug from the feed
        const shortName = row.product_name.substring(0, 120);
        const slug = slugify(
          `${brand}-${row["Telcos:storage_size"] || ""}-on-vodafone-${monthCost.toFixed(2).replace(".", "")}-${term || ""}`
        );

        const previous = existingMap.get(row.merchant_product_id);

        const dataFields = {
          name: shortName,
          category: "mobile" as const,
          subcategory: isSim ? "sim-only" : "contract",
          description: (row.description || "").substring(0, 500),
          monthlyCost: monthCost,
          annualCost: monthCost * 12,
          setupFee: initialCost,
          contractLength: term,
          dataAllowance: row["Telcos:inc_data"] || null,
          minutes: row["Telcos:inc_minutes"] || null,
          texts: row["Telcos:inc_texts"] || null,
          networkType: row["Telcos:connectivity"] || null,
          includesHandset: !isSim,
          handsetModel: isSim ? null : brand,
          imageUrl: row.merchant_image_url || null,
          affiliateUrl,
          merchantProductId: row.merchant_product_id,
        };

        if (previous) {
          // Existing plan — update fields, snapshot price if changed
          const priceChanged = previous.monthlyCost !== monthCost;

          await prisma.plan.update({
            where: { id: previous.id },
            data: dataFields,
          });

          if (priceChanged) {
            await prisma.priceHistory.create({
              data: {
                planId: previous.id,
                monthlyCost: monthCost,
                setupFee: initialCost,
              },
            });
            result.counts.priceChanges++;
            result.counts.updated++;
            console.log(
              `[feed-importer] price change: ${shortName.substring(0, 60)}: £${previous.monthlyCost} → £${monthCost}`
            );
          } else {
            result.counts.unchanged++;
          }
        } else {
          // New plan
          const plan = await prisma.plan.create({
            data: {
              ...dataFields,
              slug,
              providerId: vodafone.id,
              features: JSON.stringify([]),
            },
          });

          await prisma.priceHistory.create({
            data: {
              planId: plan.id,
              monthlyCost: monthCost,
              setupFee: initialCost,
            },
          });

          result.counts.created++;
          result.newDealUrls.push(`https://valueswitch.co.uk/deals/${slug}`);
        }
      } catch (err) {
        result.counts.errors++;
        console.error(
          `[feed-importer] error importing row ${row._uniqKey}:`,
          (err as Error).message
        );
      }
    }

    result.ok = true;
    result.durationMs = Date.now() - started;
    console.log(
      `[feed-importer] done in ${result.durationMs}ms — created ${result.counts.created}, updated ${result.counts.updated}, price changes ${result.counts.priceChanges}`
    );
    return result;
  } catch (err) {
    result.durationMs = Date.now() - started;
    result.error = err instanceof Error ? err.message : String(err);
    console.error(`[feed-importer] FAILED: ${result.error}`);
    return result;
  }
}
