import {
  getActiveOffers,
  getOfferLink,
  type OfferCategory,
} from "@/lib/offers";
import {
  fetchAutoPromotions,
  type AutoPromotion,
} from "@/lib/awin/promotions";
import type { AwinMerchantSlug } from "@/lib/affiliate";

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

/** Append our clickref to Awin's own tracked link (cread accepts it). */
function withClickref(trackedUrl: string, clickref: string): string {
  try {
    const u = new URL(trackedUrl);
    if (u.hostname.endsWith("awin1.com") && !u.searchParams.has("clickref")) {
      u.searchParams.set("clickref", clickref);
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

export async function getDisplayOffers(): Promise<DisplayOffer[]> {
  const curated: DisplayOffer[] = getActiveOffers().map((o) => ({
    id: o.id,
    merchant: o.merchant,
    merchantName: o.merchantName,
    title: o.title,
    description: o.description,
    code: o.code,
    endsAt: o.endsAt,
    category: o.category,
    badge: o.badge,
    href: getOfferLink(o),
    source: "curated",
  }));

  const auto = await fetchAutoPromotions();
  const extras: DisplayOffer[] = auto
    .filter((a) => !isDuplicate(a, curated))
    .map((a) => ({
      id: a.id,
      merchant: a.merchant,
      merchantName: a.merchantName,
      title: a.title,
      description: a.description,
      code: a.code,
      endsAt: a.endsAt,
      category: a.category,
      badge: a.badge,
      href: withClickref(a.trackedUrl, `offers_${a.id}`),
      source: "awin",
    }));

  return [...curated, ...extras];
}
