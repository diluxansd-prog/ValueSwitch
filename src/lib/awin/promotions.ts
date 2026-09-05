/**
 * Awin Publisher Promotions API client — the feed behind the dashboard's
 * "My Offers" page (Toolbox → My Offers).
 *
 * Auth: same Bearer token as reports.ts (Awin → Account → API Credentials,
 * env vars AWIN_API_TOKEN + AWIN_PUBLISHER_ID). When they're unset the
 * fetch returns [] so callers fall back to the curated static list.
 *
 * Endpoint: POST https://api.awin.com/publishers/{publisherId}/promotions/
 */

import { AWIN_MERCHANTS, type AwinMerchantSlug } from "@/lib/affiliate";
import type { OfferCategory } from "@/lib/offers";

const BASE = "https://api.awin.com";

/** Raw API row — fields we rely on; everything else is ignored. */
interface ApiPromotion {
  promotionId?: number;
  type?: string; // "promotion" | "voucher"
  advertiser?: { id?: number; name?: string };
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  url?: string;
  urlTracking?: string;
  voucher?: { code?: string } | null;
  regions?: { countryCode?: string }[];
}

export interface AutoPromotion {
  id: string;
  merchant: AwinMerchantSlug;
  merchantName: string;
  title: string;
  description: string;
  code?: string;
  /** ISO yyyy-mm-dd */
  startsAt?: string;
  /** ISO yyyy-mm-dd */
  endsAt?: string;
  category: OfferCategory;
  /** Awin's own tracked deeplink for this promotion */
  trackedUrl: string;
  badge: string;
}

/** MID → merchant slug, inverted from AWIN_MERCHANTS. */
const MID_TO_SLUG: Record<string, AwinMerchantSlug> = Object.fromEntries(
  Object.entries(AWIN_MERCHANTS).map(([slug, mid]) => [
    mid,
    slug as AwinMerchantSlug,
  ])
);

/** Which section each partner's promotions belong in. */
const MERCHANT_CATEGORY: Record<AwinMerchantSlug, OfferCategory> = {
  vodafone: "sim",
  talkmobile: "sim",
  lebara: "sim",
  voxi: "sim",
  "1pmobile": "sim",
  scancom: "sim",
  "sim-local": "sim",
  quickline: "broadband",
  "highland-broadband": "broadband",
  "connect-fibre": "broadband",
  "be-fibre": "broadband",
  "lightning-fibre": "broadband",
  worldsim: "travel-esim",
  knowroaming: "travel-esim",
  mozillion: "travel-esim",
  ttfone: "phones",
  fonehouse: "phones",
};

/** "50% off X" → "50% OFF"; "£300 reward" → "£300"; fallback CODE/OFFER. */
function deriveBadge(title: string, hasCode: boolean): string {
  const pct = title.match(/(\d{1,3})\s*%/);
  if (pct) return `${pct[1]}% OFF`;
  const gbp = title.match(/£\s?(\d+(?:\.\d{2})?)/);
  if (gbp) return `£${gbp[1]}`;
  if (/\bfree\b/i.test(title)) return "FREE";
  return hasCode ? "CODE" : "OFFER";
}

function toIsoDate(s?: string): string | undefined {
  if (!s) return undefined;
  const d = new Date(s.replace(" ", "T"));
  return isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
}

export interface AutoPromotionResult {
  promos: AutoPromotion[];
  /**
   * Non-secret one-word diagnostic for the page to expose, e.g.
   * "ok:34", "no-creds", "http:401", "empty:200", "error". Lets us
   * debug the production fetch from the rendered HTML without log access.
   */
  note: string;
}

/**
 * Fetch active promotions for our joined UK-relevant partners.
 * Returns promos: [] on any failure (no creds, API change, network) so
 * the offers page can always fall back to the curated static list.
 */
export async function fetchAutoPromotions(): Promise<AutoPromotionResult> {
  const token = process.env.AWIN_API_TOKEN;
  const publisherId = process.env.AWIN_PUBLISHER_ID;
  if (!token || !publisherId) return { promos: [], note: "no-creds" };

  try {
    // Docs use the singular "publisher" segment for this endpoint (the
    // reports API uses plural) — try singular first, then plural, then a
    // minimal body, so a docs discrepancy can't silently disable the feed.
    const attempts: { path: string; body: unknown }[] = [
      {
        path: `${BASE}/publisher/${publisherId}/promotions`,
        body: {
          filters: { membership: "joined", status: "active", type: "all" },
          pagination: { page: 1, pageSize: 200 },
        },
      },
      {
        path: `${BASE}/publishers/${publisherId}/promotions`,
        body: {
          filters: { membership: "joined", status: "active", type: "all" },
          pagination: { page: 1, pageSize: 200 },
        },
      },
      {
        path: `${BASE}/publisher/${publisherId}/promotions`,
        body: { pagination: { page: 1, pageSize: 200 } },
      },
    ];

    let rows: ApiPromotion[] = [];
    let lastStatus = 0;
    for (const attempt of attempts) {
      const res = await fetch(attempt.path, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(attempt.body),
        // Re-fetch every 6h; the page's revalidate controls render cadence.
        next: { revalidate: 21600 },
      });
      lastStatus = res.status;
      if (!res.ok) continue;
      const json = (await res.json()) as
        | { data?: ApiPromotion[] }
        | ApiPromotion[];
      rows = Array.isArray(json)
        ? json
        : Array.isArray(json?.data)
          ? json.data
          : [];
      if (rows.length > 0) break;
    }
    if (rows.length === 0) {
      console.error(`[awin promotions] no rows (last HTTP ${lastStatus})`);
    }
    const now = new Date();
    const out: AutoPromotion[] = [];

    for (const p of rows) {
      const mid = p.advertiser?.id != null ? String(p.advertiser.id) : "";
      const slug = MID_TO_SLUG[mid];
      if (!slug) continue; // not one of our UK-relevant partners

      // UK or unrestricted only
      const regions = p.regions ?? [];
      const ukOk =
        regions.length === 0 ||
        regions.some((r) => !r.countryCode || r.countryCode === "GB");
      if (!ukOk) continue;

      // Must still be running (and already started)
      const ends = p.endDate ? new Date(p.endDate.replace(" ", "T")) : null;
      if (ends && ends < now) continue;
      const starts = p.startDate
        ? new Date(p.startDate.replace(" ", "T"))
        : null;
      if (starts && starts > now) continue;

      const title = (p.title || "").trim();
      const trackedUrl = p.urlTracking || p.url || "";
      if (!title || !trackedUrl) continue;

      const code = p.voucher?.code?.trim() || undefined;
      out.push({
        id: `awin-${p.promotionId ?? `${mid}-${title.slice(0, 24)}`}`,
        merchant: slug,
        merchantName: p.advertiser?.name?.trim() || slug,
        title,
        description: (p.description || "").trim() || title,
        code,
        startsAt: toIsoDate(p.startDate),
        endsAt: toIsoDate(p.endDate),
        category: MERCHANT_CATEGORY[slug],
        trackedUrl,
        badge: deriveBadge(title, !!code),
      });
    }
    const note =
      rows.length === 0
        ? lastStatus === 200
          ? "empty:200"
          : `http:${lastStatus}`
        : `ok:${rows.length}:kept:${out.length}`;
    return { promos: out, note };
  } catch (err) {
    console.error("[awin promotions] fetch failed:", err);
    return { promos: [], note: "error" };
  }
}
