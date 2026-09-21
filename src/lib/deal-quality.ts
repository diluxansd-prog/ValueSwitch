/**
 * Guards against feed rows that carry a handset name but only an
 * airtime price.
 *
 * Some retailer feeds (Fonehouse's iPhone 18 rows, for example) list the
 * plan element of a contract with the phone's name attached: an "iPhone
 * 18 Pro Max 2TB" at £13/month with £156 total and no upfront. Publishing
 * that as a phone price would badly mislead readers, so anything whose
 * whole-term cost can't plausibly cover the handset is treated as
 * airtime-only and kept out of handset listings.
 */

export interface DealCostFields {
  name: string;
  monthlyCost: number;
  setupFee?: number | null;
  contractLength?: number | null;
  includesHandset?: boolean | null;
}

/** Whole-term cost: monthly × term + upfront. */
export function termTotal(deal: DealCostFields): number {
  const months = deal.contractLength && deal.contractLength > 0 ? deal.contractLength : 1;
  return deal.monthlyCost * months + (deal.setupFee ?? 0);
}

/**
 * Minimum believable whole-term cost for a named handset. Flagship
 * models cost far more than a SIM plan, so a "Pro Max" listing totalling
 * £156 is a mislabelled airtime row, not a bargain.
 */
export function handsetCostFloor(name: string): number {
  const n = name.toLowerCase();
  // Pre-owned and refurbished handsets legitimately cost far less.
  if (/(refurb|pre-owned|preowned|used)/.test(n)) return 200;
  if (/(pro max|ultra|fold|2tb)/.test(n)) return 900;
  if (/(pro\b|plus\b|1tb)/.test(n)) return 700;
  return 400;
}

/** True when the listing's total is consistent with including a phone. */
export function isPlausibleHandsetDeal(deal: DealCostFields): boolean {
  return termTotal(deal) >= handsetCostFloor(deal.name);
}

const HANDSET_NAME =
  /\b(iphone|galaxy|pixel|xperia|oneplus|redmi|xiaomi|motorola|moto g|nokia|honor|oppo|vivo|huawei|nothing phone)\b/i;

/** True when the listing names a phone model (as opposed to a SIM plan). */
export function namesHandset(name: string): boolean {
  return HANDSET_NAME.test(name);
}

/**
 * True for a contract row that names a phone but whose whole-term cost
 * can't include one — e.g. "iPhone 17 Pro Max 256GB" at £9/month with no
 * upfront. These are mis-parsed or airtime-only feed rows and must never
 * be published as phone prices.
 */
export function isAirtimeOnlyRow(deal: DealCostFields): boolean {
  if (deal.includesHandset === false) return false;
  return namesHandset(deal.name) && !isPlausibleHandsetDeal(deal);
}

/**
 * Repairs UTF-8 text that was decoded as Latin-1 upstream (Vodafone's
 * feed ships "at Â£10" instead of "at £10").
 */
export function fixMojibake(text: string): string {
  return text
    .replace(/Â£/g, "£")
    .replace(/â‚¬/g, "€")
    .replace(/â€™/g, "’")
    .replace(/â€˜/g, "‘")
    .replace(/â€œ/g, "“")
    .replace(/â€“/g, "–")
    .replace(/â€”/g, "—")
    .replace(/Ã©/g, "é")
    .replace(/Â(?=\s)/g, "");
}
