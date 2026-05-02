/**
 * Score a phone deal by how recent the device is.
 *
 * Used to surface "iPhone 17 Pro Max" before "iPhone 13 Refurbished" in
 * brand grids and the home-page flagship strip — newer-first matches what
 * users are searching for and what merchants actually want promoted.
 *
 * Returns an integer where higher = more recent. Returns 0 when no
 * recognised model is found (so unknown/SIM-only deals sink to the bottom).
 */
export interface PhoneRecency {
  score: number;
  modelLabel: string; // e.g. "iPhone 17 Pro Max", "Galaxy S25 Ultra"
}

const FAMILY_BASE: Array<{
  pattern: RegExp;
  multiplier: number;
  label: string;
}> = [
  { pattern: /iPhone\s*(\d{1,2})/i, multiplier: 100, label: "iPhone" },
  { pattern: /Galaxy\s*S\s*(\d{1,2})/i, multiplier: 100, label: "Galaxy S" },
  { pattern: /Galaxy\s*Z\s*Fold\s*(\d{1,2})/i, multiplier: 90, label: "Galaxy Z Fold" },
  { pattern: /Galaxy\s*Z\s*Flip\s*(\d{1,2})/i, multiplier: 90, label: "Galaxy Z Flip" },
  { pattern: /Galaxy\s*A\s*(\d{1,2})/i, multiplier: 50, label: "Galaxy A" },
  { pattern: /Pixel\s*(\d{1,2})/i, multiplier: 95, label: "Pixel" },
  { pattern: /OnePlus\s*(\d{1,2})/i, multiplier: 80, label: "OnePlus" },
  { pattern: /Xiaomi\s*(\d{1,2}|14T?|15T?)/i, multiplier: 70, label: "Xiaomi" },
  { pattern: /Redmi\s*Note\s*(\d{1,2})/i, multiplier: 60, label: "Redmi Note" },
];

const VARIANT_BONUSES: Array<{ pattern: RegExp; bonus: number; tag: string }> = [
  // Higher-tier variants of the same generation should sort above the base model
  { pattern: /Pro\s*Max\b/i, bonus: 5, tag: "Pro Max" },
  { pattern: /Ultra\b/i, bonus: 4, tag: "Ultra" },
  { pattern: /Pro\b/i, bonus: 3, tag: "Pro" },
  { pattern: /Plus\b/i, bonus: 2, tag: "Plus" },
  { pattern: /Max\b/i, bonus: 2, tag: "Max" },
];

export function scorePhoneRecency(productName: string): PhoneRecency {
  if (!productName) return { score: 0, modelLabel: "" };

  for (const fam of FAMILY_BASE) {
    const m = productName.match(fam.pattern);
    if (!m) continue;
    const generation = parseInt(m[1], 10);
    if (!isFinite(generation)) continue;

    // Score formula: family multiplier ranks families against each other,
    // then generation provides finer ordering, plus variant bonus.
    let score = fam.multiplier + generation * 10;

    let variantTag = "";
    for (const v of VARIANT_BONUSES) {
      if (v.pattern.test(productName)) {
        score += v.bonus;
        variantTag = v.tag;
        break; // highest matching variant wins
      }
    }

    const label = variantTag
      ? `${fam.label} ${generation} ${variantTag}`
      : `${fam.label} ${generation}`;
    return { score, modelLabel: label };
  }

  return { score: 0, modelLabel: "" };
}

/** Sort an array of phones with `name` field — newest first, then cheapest. */
export function sortByRecencyThenPrice<
  T extends { name: string; monthlyCost?: number }
>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const sa = scorePhoneRecency(a.name).score;
    const sb = scorePhoneRecency(b.name).score;
    if (sa !== sb) return sb - sa;
    return (a.monthlyCost ?? Infinity) - (b.monthlyCost ?? Infinity);
  });
}
