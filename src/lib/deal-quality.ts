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
  if (/(pro max|ultra|fold|2tb)/.test(n)) return 900;
  if (/(pro\b|plus\b|1tb)/.test(n)) return 700;
  return 400;
}

/** True when the listing's total is consistent with including a phone. */
export function isPlausibleHandsetDeal(deal: DealCostFields): boolean {
  return termTotal(deal) >= handsetCostFloor(deal.name);
}
