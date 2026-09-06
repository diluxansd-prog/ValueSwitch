import {
  getActiveOffers,
  getOfferLink,
  type OfferCategory,
} from "@/lib/offers";
import {
  fetchAutoPromotions,
  type AutoPromotion,
} from "@/lib/awin/promotions";
import { MERCHANT_HOMEPAGES, type AwinMerchantSlug } from "@/lib/affiliate";

/**
 * Live offer feed for display — curated entries first (hand-written
 * copy and verified deeplinks), then any additional active promotions
 * pulled automatically from the Awin Promotions API that the curated
 * list doesn't already cover. New partner promotions therefore appear
 * on the site without a deploy, and expired ones drop off on the next
 * revalidate. When API credentials are missing or the call fails, the
 * page silently serves just the curated list.
 */

export interface DisplayOffer {
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
  badge: string;
  href: string;
  source: "curated" | "awin";
}

function titleWords(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9£% ]+/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
}

/** Jaccard word overlap — used to spot the same promo under two titles. */
function similarTitles(a: string, b: string): boolean {
  const wa = titleWords(a);
  const wb = titleWords(b);
  if (wa.size === 0 || wb.size === 0) return false;
  let common = 0;
  for (const w of wa) if (wb.has(w)) common++;
  return common / (wa.size + wb.size - common) >= 0.45;
}

/** Verified landing pages for merchants whose advertiser deeplinks are
 *  known to rot (stale basket SKUs render an empty cart). Checked live. */
const SAFE_LANDINGS: Partial<Record<AwinMerchantSlug, string>> = {
  vodafone: "https://www.vodafone.co.uk/sim-only/best-sim-only-deals",
  voxi: "https://www.voxi.co.uk/sim-only-plans",
  lebara: "https://www.lebara.co.uk/en/best-sim-only-deals.html",
  quickline: "https://quickline.co.uk/home-broadband/full-fibre-broadband/",
};

/** Append our clickref, and sanitize rotten advertiser deeplinks: a ued
 *  pointing at a basket/cart/checkout dies the moment the SKU expires
 *  (users see an empty cart), so rewrite those to a verified landing
 *  page for the merchant instead. */
function withClickref(
  trackedUrl: string,
  clickref: string,
  merchant: AwinMerchantSlug
): string {
  try {
    const u = new URL(trackedUrl);
    if (u.hostname.endsWith("awin1.com")) {
      if (!u.searchParams.has("clickref")) {
        u.searchParams.set("clickref", clickref);
      }
      const ued = u.searchParams.get("ued");
      if (ued && /\/(basket|cart|checkout)/i.test(ued)) {
        const safe =
          SAFE_LANDINGS[merchant] ?? MERCHANT_HOMEPAGES[merchant];
        if (safe) u.searchParams.set("ued", safe);
      }
    }
    return u.toString();
  } catch {
    return trackedUrl;
  }
}

function isDuplicate(
  auto: AutoPromotion,
  curated: { merchant: string; code?: string; title: string }[]
): boolean {
  return curated.some(
    (c) =>
      c.merchant === auto.merchant &&
      ((auto.code && c.code && auto.code.toLowerCase() === c.code.toLowerCase()) ||
        similarTitles(c.title, auto.title))
  );
}

export interface DisplayOffersResult {
  offers: DisplayOffer[];
  /** Non-secret diagnostic from the promotions fetch (e.g. "ok:34:kept:12") */
  note: string;
}

export async function getDisplayOffers(): Promise<DisplayOffersResult> {
  const curated: DisplayOffer[] = getActiveOffers().map((o) => ({
    id: o.id,
    merchant: o.merchant,
    merchantName: o.merchantName,
    title: o.title,
    description: o.description,
    code: o.code,
    startsAt: o.startsAt,
    endsAt: o.endsAt,
    category: o.category,
    badge: o.badge,
    href: getOfferLink(o),
    source: "curated",
  }));

  const { promos, note } = await fetchAutoPromotions();
  // Cap auto promos at 3 per merchant (newest first) — some advertisers
  // publish near-identical evergreen promos (7× 1pMobile data boosts)
  // that all land on the same page and just clutter the grid.
  const perMerchantCount = new Map<string, number>();
  const extras: DisplayOffer[] = promos
    .filter((a) => !isDuplicate(a, curated))
    .sort((a, b) => (b.startsAt ?? "0000").localeCompare(a.startsAt ?? "0000"))
    .filter((a) => {
      const n = perMerchantCount.get(a.merchant) ?? 0;
      if (n >= 3) return false;
      perMerchantCount.set(a.merchant, n + 1);
      return true;
    })
    .map((a) => ({
      id: a.id,
      merchant: a.merchant,
      merchantName: a.merchantName,
      title: a.title,
      description: a.description,
      code: a.code,
      startsAt: a.startsAt,
      endsAt: a.endsAt,
      category: a.category,
      badge: a.badge,
      href: withClickref(a.trackedUrl, `offers_${a.id}`, a.merchant),
      source: "awin",
    }));

  // Newest promotions first — offers without a known start date sink to
  // the end of their recency band rather than jumping the queue.
  const offers = [...curated, ...extras].sort((a, b) =>
    (b.startsAt ?? "0000").localeCompare(a.startsAt ?? "0000")
  );
  return { offers, note };
}
