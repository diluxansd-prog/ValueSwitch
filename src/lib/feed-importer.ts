/**
 * Awin Product Feed importer (merchant-agnostic).
 *
 * Given a MerchantFeedConfig + feed URL, fetches the latest gzipped CSV
 * from Awin, diffs it against the DB, and applies three side effects:
 *
 *   1. Import new plans (with stable affiliate URLs to merchant landing
 *      pages from the config — never expiring SKU-level deep links)
 *   2. Update existing plans if price or metadata changed
 *   3. Snapshot every price change to PriceHistory
 *
 * The provider record (Provider.slug === merchant.slug) must already
 * exist in the DB.  Throws otherwise.
 *
 * Usage:
 *   for (const m of getActiveMerchantFeeds()) {
 *     await importFeed(m, m.feedUrl);
 *   }
 *
 * All side effects are idempotent — running twice is safe.
 */
import { prisma } from "@/lib/prisma";
import { gunzipSync } from "zlib";
import { generateAwinLink } from "@/lib/affiliate";
import type { MerchantFeedConfig } from "@/config/merchants";

export interface FeedImportResult {
  ok: boolean;
  merchant: string;
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

/**
 * Vodafone retired their /web-shop/deeplink?handsetSkuId=...&planSkuId=...
 * endpoint — it now returns 404.  The exact same SKU pair, however, works at
 * /basket?planSkuId=...&deviceSkuId=... (parameter renamed: handsetSkuId →
 * deviceSkuId).  Transform old-style URLs on the fly so clicks land on the
 * working basket page.  Tested live 2026-04-18.
 */
function rewriteVodafoneUrl(url: string | undefined | null): string | null {
  if (!url || !url.startsWith("http")) return null;
  try {
    const u = new URL(url);
    if (u.hostname !== "www.vodafone.co.uk") return url;

    if (u.pathname === "/web-shop/deeplink") {
      const hsku = u.searchParams.get("handsetSkuId");
      const psku = u.searchParams.get("planSkuId");
      if (hsku && psku) {
        return `https://www.vodafone.co.uk/basket?planSkuId=${psku}&deviceSkuId=${hsku}`;
      }
      return null; // not enough params, bail
    }
    return url;
  } catch {
    return null;
  }
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
  merchant_id: string; // which Awin merchant this row belongs to
  product_name: string;
  description: string;
  merchant_name: string;
  merchant_category: string;
  search_price: string; // display price as-is from feed
  merchant_image_url: string;
  merchant_deep_link: string;
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

/**
 * Some merchants (e.g. Fonehouse) ship a feed without the Telcos:* schema
 * — the structured fields are embedded in product_name like:
 *   "iPhone 16 Pro 128GB Black on Three Contract | £44pm Unlimited Data | £149 upfront cost"
 *
 * Parse that into virtual Telcos fields so the rest of the importer can
 * treat both feed shapes identically.
 */
/**
 * Extract a canonical brand from a product name.  Handles both
 *   "Apple iPhone 16 Pro"  (brand-prefixed)
 *   "iPhone 16 Pro 128GB"  (model-prefixed — Fonehouse style)
 */
function extractBrand(name: string): string {
  const n = name.toLowerCase();
  if (/^(apple|iphone)/.test(n)) return "Apple";
  if (/^(samsung|galaxy)/.test(n)) return "Samsung";
  if (/^(google|pixel)/.test(n)) return "Google";
  if (/^huawei\b/.test(n)) return "Huawei";
  if (/^honor\b/.test(n)) return "Honor";
  if (/^(motorola|moto\s|moto-)/.test(n)) return "Motorola";
  if (/^oneplus\b/.test(n)) return "OnePlus";
  if (/^(xiaomi|redmi|poco)\b/.test(n)) return "Xiaomi";
  if (/^sony\b/.test(n)) return "Sony";
  if (/^nokia\b/.test(n)) return "Nokia";
  if (/^doro\b/.test(n)) return "Doro";
  if (/^zte\b/.test(n)) return "ZTE";
  if (/^vodafone\b/.test(n)) return "Vodafone";
  if (/^nothing\b/.test(n)) return "Nothing";
  if (/^asus\b/.test(n)) return "Asus";
  if (/^realme\b/.test(n)) return "Realme";
  if (/^oppo\b/.test(n)) return "Oppo";
  if (/^hmd\b/.test(n)) return "HMD";
  if (/^cat\b/.test(n)) return "CAT";
  if (/^tcl\b/.test(n)) return "TCL";
  if (/^alcatel\b/.test(n)) return "Alcatel";
  return "Other";
}

function inferTelcosFromText(row: Record<string, string>): Record<string, string> {
  const name = row.product_name || "";
  const desc = row.description || "";
  const dl = row.merchant_deep_link || "";
  // Combine name + description + URL — Fonehouse stores contract data in
  // the URL slug like "vodafone-29pm-unlimited" or "three-unlimited-new-24-month-25.00"
  const haystack = `${name} ${desc} ${dl}`;
  const out: Record<string, string> = {};

  // ─── Monthly cost — try multiple patterns ───
  // 1. "£44pm" / "£44 a month" / "£44/mo" / "£44 per month" (text)
  let monthMatch = haystack.match(/£\s*(\d+(?:\.\d+)?)\s*(?:pm|\/mo|a\s*month|per\s*month)/i);
  // 2. URL form: "-29pm-" or "vodafone-29pm-..."
  if (!monthMatch) monthMatch = dl.match(/-(\d+(?:\.\d+)?)pm[-/]/i);
  // 3. URL form: "-24-month-44.00/" or "-12-month-25.99-"
  if (!monthMatch) monthMatch = dl.match(/-\d+-month(?:-upgrade)?-(\d+(?:\.\d+)?)[/-]/i);
  // 4. URL form ends with price: "...band-d-new-19.50"
  if (!monthMatch) monthMatch = dl.match(/-(\d+(?:\.\d{1,2}))(?:[/?]|$)/);
  if (monthMatch) out["Telcos:month_cost"] = monthMatch[1];

  // ─── Upfront cost ───
  // "£149 upfront cost" / "£0 upfront"
  let upfrontMatch = haystack.match(/£\s*(\d+(?:\.\d+)?)\s*upfront/i);
  // search_price column on Fonehouse IS the upfront cost when monthCost was extracted from elsewhere
  if (!upfrontMatch) {
    const sp = parseFloat(row.search_price || "");
    if (isFinite(sp) && sp >= 0 && sp < 1000) {
      out["Telcos:initial_cost"] = String(sp);
    }
  } else {
    out["Telcos:initial_cost"] = upfrontMatch[1];
  }
  if (!out["Telcos:initial_cost"]) out["Telcos:initial_cost"] = "0";

  // ─── Contract length ───
  const termMatch = haystack.match(/(\d+)[\s-]*month/i);
  if (termMatch) out["Telcos:term"] = termMatch[1];

  // ─── Network ───
  // Text form: "on Three Contract"
  let networkMatch = haystack.match(/\bon\s+(EE|Three|O2|Vodafone|Sky\s*Mobile|iD\s*Mobile|Virgin\s*Media|giffgaff|Tesco\s*Mobile|VOXI|Talkmobile|Lebara|Plusnet|Smarty)\b/i);
  // URL form: hostname/basket/add/contract/<phone>/<network>-...
  if (!networkMatch) {
    networkMatch = dl.match(/\/(?:contract|sim|upgrade)\/[^/]+\/(ee|three|o2|vodafone|sky-mobile|id-mobile|virgin|giffgaff|tesco-mobile|voxi|talkmobile|lebara|plusnet|smarty)[-/]/i);
  }
  if (networkMatch) {
    out["Telcos:network"] = networkMatch[1].replace(/-/g, " ").replace(/\s+/g, " ");
  }

  // ─── Storage ─── (must come BEFORE data so we don't confuse "128GB" storage with data)
  // Match the FIRST occurrence in product_name only — that's the device storage.
  const storageMatch = name.match(/\b(\d+\s*(?:GB|TB))\b/i);
  const deviceStorage = storageMatch ? storageMatch[1].replace(/\s+/g, "") : null;
  if (deviceStorage) out["Telcos:storage_size"] = deviceStorage;

  // ─── Data allowance ───
  // 1. "Unlimited Data" / "300GB Data" (text — explicitly tagged as data)
  let dataMatch = haystack.match(/(Unlimited|\d+(?:\.\d+)?\s*[GM]B)\s*Data\b/i);
  // 2. URL form: "vodafone-unlimited-" / "three-300gb-new"
  if (!dataMatch)
    dataMatch = dl.match(/-(unlimited|\d+(?:\.\d+)?gb)-(?:new|\d+-month|upgrade|extra)/i);
  // 3. URL form near end: "vodafone-29pm-100gb"
  if (!dataMatch) dataMatch = dl.match(/-\d+pm-(unlimited|\d+(?:\.\d+)?gb)/i);
  if (dataMatch) {
    let val = dataMatch[1].replace(/\s+/g, "").replace(/Data$/i, "");
    // Don't accidentally use the device's storage size as data allowance
    if (val.toLowerCase() === (deviceStorage || "").toLowerCase()) val = "";
    if (val) out["Telcos:inc_data"] = val;
  }

  // ─── 5G / 4G ───
  if (/5G/i.test(haystack)) out["Telcos:connectivity"] = "5G";
  else if (/4G/i.test(haystack)) out["Telcos:connectivity"] = "4G";

  // ─── SIM-only detection ───
  const isSimOnly =
    /\bsim[\s-]?only\b/i.test(haystack) ||
    /\/basket\/add\/sim/i.test(dl);
  out["Telcos:contract_type"] = isSimOnly ? "SIM Only" : "Pay Monthly Contract";

  return out;
}

function parseFeedToPlans(csv: string): Array<FeedRow & { _uniqKey: string }> {
  const lines = csv.split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const hasTelcosCols = headers.some((h) => h.startsWith("Telcos:"));
  const rows: Array<FeedRow & { _uniqKey: string }> = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || !line.trim()) continue;

    const vals = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => (row[h] = vals[idx] || ""));

    if (!row.merchant_product_id) continue;

    // If the feed didn't have Telcos columns, infer them from product_name
    // + description + merchant_deep_link.  Critical for Fonehouse and
    // similar retailers whose Awin feed schema is just basic.
    if (!hasTelcosCols) {
      Object.assign(row, inferTelcosFromText(row));
    }

    // Pick monthly price.  IMPORTANT: only fall back to search_price for
    // feeds that DID have Telcos columns (Vodafone-style, where
    // search_price IS the monthly cost).  For inferred feeds (e.g.
    // Fonehouse), search_price is the upfront cost — using it would
    // mis-label every deal.  Require the inferred Telcos:month_cost.
    const rawMonth = hasTelcosCols
      ? row["Telcos:month_cost"] || row.search_price || "0"
      : row["Telcos:month_cost"] || "0";
    const monthCost = parseFloat(rawMonth);
    if (!isFinite(monthCost) || monthCost <= 0) continue;
    // Sanity: skip pure accessories (priced above £200/mo are usually misparses)
    if (monthCost > 200) continue;

    rows.push({
      ...(row as unknown as FeedRow),
      _uniqKey: row.merchant_product_id,
    });
  }

  return rows;
}

/**
 * Reduce raw variants to one representative deal per
 * (brand, storage, contract length, data allowance, contract type).
 * Keeps the cheapest for each unique combo — users get a diverse
 * catalogue without 50 near-identical variants of the same phone.
 */
function dedupe(
  rows: Array<FeedRow & { _uniqKey: string }>
): Array<FeedRow & { _uniqKey: string }> {
  type Bucket = { key: string; row: (FeedRow & { _uniqKey: string }); price: number };
  const buckets = new Map<string, Bucket>();

  for (const r of rows) {
    const name = r.product_name || "";
    const brand = extractBrand(name).toLowerCase();
    const storage = (r["Telcos:storage_size"] || "").replace(/\s+/g, "");
    const term = r["Telcos:term"] || "";
    const data = (r["Telcos:inc_data"] || "").replace(/\s+/g, "");
    const ctype = (r["Telcos:contract_type"] || "").toLowerCase().replace(/\s+/g, "");
    // Extract "Pro Max", "Ultra", etc. from product_name to preserve variants
    const modelHint = (name.match(/\b(pro max|pro|max|ultra|plus|mini|lite|fold|flip|edge|ace)\b/i)?.[0] || "").toLowerCase();

    const price = parseFloat(
      r["Telcos:month_cost"] ||
        (r as unknown as Record<string, string>).search_price ||
        "0"
    );
    if (!isFinite(price) || price <= 0) continue;

    const key = `${brand}|${modelHint}|${storage}|${term}|${data}|${ctype}`;
    const existing = buckets.get(key);
    if (!existing || price < existing.price) {
      buckets.set(key, { key, row: r, price });
    }
  }

  return [...buckets.values()].map((b) => b.row);
}

export async function importFeed(
  merchant: MerchantFeedConfig,
  feedUrl: string
): Promise<FeedImportResult> {
  const started = Date.now();
  const result: FeedImportResult = {
    ok: false,
    merchant: merchant.slug,
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
    console.log(
      `[feed-importer:${merchant.slug}] fetching ${feedUrl.substring(0, 80)}...`
    );
    const { csv, bytes } = await fetchFeed(feedUrl);
    console.log(
      `[feed-importer:${merchant.slug}] downloaded ${bytes} bytes, parsing...`
    );

    const rows = parseFeedToPlans(csv);
    result.counts.totalRows = rows.length;

    // If the CSV contains multiple merchants, keep only rows for THIS
    // merchant. Awin sometimes ships a combined feed for publishers who
    // joined multiple programmes.
    const merchantRows = rows.filter(
      (r) =>
        !r.merchant_id || r.merchant_id === merchant.awinMerchantId
    );
    console.log(
      `[feed-importer:${merchant.slug}] ${merchantRows.length}/${rows.length} rows match merchant_id=${merchant.awinMerchantId}`
    );

    const deduped = dedupe(merchantRows).slice(0, 200); // safety cap
    result.counts.uniqueDeals = deduped.length;

    const provider = await prisma.provider.findUnique({
      where: { slug: merchant.slug },
    });
    if (!provider)
      throw new Error(
        `Provider "${merchant.slug}" not found in DB — create it first`
      );

    // Pull current provider plans keyed by merchantProductId for diffing
    const existing = await prisma.plan.findMany({
      where: { providerId: provider.id },
      select: {
        id: true,
        merchantProductId: true,
        monthlyCost: true,
      },
    });
    const existingMap = new Map(existing.map((p) => [p.merchantProductId, p]));

    for (const row of deduped) {
      try {
        // parseFeedToPlans already filtered out rows without a valid
        // monthCost — including the inferred-Telcos / Fonehouse case.
        const monthCost = parseFloat(row["Telcos:month_cost"]);
        if (!isFinite(monthCost) || monthCost <= 0) {
          result.counts.errors++;
          continue;
        }
        const initialCost = parseFloat(row["Telcos:initial_cost"]) || 0;
        const term = parseInt(row["Telcos:term"], 10) || null;
        const isSim =
          /sim[\s-]?only|simo/i.test(row["Telcos:contract_type"]) ||
          /sim[\s-]?only/i.test(row.product_name);

        const brand = extractBrand(row.product_name || "");
        const clickref = isSim
          ? `deal_simonly_${merchant.slug}`
          : `deal_${brand.toLowerCase()}_${merchant.slug}`;

        // PREFER the feed's specific product deep link (lands the user
        // on the exact deal on the merchant's site). Only fall back to
        // the category landing page if the feed didn't provide one.
        const rawDeepLink = (row as unknown as Record<string, string>).merchant_deep_link;
        const merchantDeepLink = rewriteVodafoneUrl(rawDeepLink);
        const fallbackLanding = isSim
          ? merchant.landingPages.simOnly
          : merchant.landingPages.handset;
        const destination =
          merchantDeepLink && merchantDeepLink.startsWith("http")
            ? merchantDeepLink
            : fallbackLanding;

        const affiliateUrl = generateAwinLink({
          merchantId: merchant.awinMerchantId,
          destinationUrl: destination,
          clickref,
        });

        // Generate a readable plan name/slug from the feed
        const shortName = row.product_name.substring(0, 120);
        // Append a short hash of merchant_product_id to guarantee uniqueness
        // even when brand/storage/price collide between variants.
        const idSuffix = row.merchant_product_id.toString().slice(-6);
        const slug = slugify(
          `${brand}-${row["Telcos:storage_size"] || ""}-${merchant.slug}-${monthCost.toFixed(0)}mo-${term || ""}m-${idSuffix}`
        );

        const previous = existingMap.get(row.merchant_product_id);

        const dataFields = {
          name: shortName,
          category: merchant.category,
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
          merchantDeepLink: merchantDeepLink || null,
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
              `[feed-importer:${merchant.slug}] price change: ${shortName.substring(0, 60)}: £${previous.monthlyCost} → £${monthCost}`
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
              providerId: provider.id,
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
          `[feed-importer:${merchant.slug}] error importing row ${row._uniqKey}:`,
          (err as Error).message
        );
      }
    }

    result.ok = true;
    result.durationMs = Date.now() - started;
    console.log(
      `[feed-importer:${merchant.slug}] done in ${result.durationMs}ms — created ${result.counts.created}, updated ${result.counts.updated}, price changes ${result.counts.priceChanges}`
    );
    return result;
  } catch (err) {
    result.durationMs = Date.now() - started;
    result.error = err instanceof Error ? err.message : String(err);
    console.error(`[feed-importer:${merchant.slug}] FAILED: ${result.error}`);
    return result;
  }
}
