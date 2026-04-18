/**
 * Awin Affiliate Link Generator
 *
 * Uses the `cread.php` format which works for ANY page on the merchant site
 * and doesn't expire like product-specific `pclick.php` URLs.
 *
 * Format:
 * https://www.awin1.com/cread.php?awinmid=MID&awinaffid=AFFID&ued=ENCODED_URL
 *
 * With clickref tracking:
 * https://www.awin1.com/cread.php?awinmid=MID&awinaffid=AFFID&clickref=SOURCE&ued=ENCODED_URL
 */

/** Your Awin publisher ID (valueswitch.co.uk) */
export const AWIN_AFFILIATE_ID = "2798806";

/** Merchant IDs (MID) — the integer Awin uses to identify each advertiser */
export const AWIN_MERCHANTS = {
  vodafone: "1257",
  talkmobile: "2351",
  ttfone: "28737",
  lebara: "30681",
} as const;

export type AwinMerchantSlug = keyof typeof AWIN_MERCHANTS;

/** Homepage URLs used as fallback / base links for each merchant */
export const MERCHANT_HOMEPAGES: Record<AwinMerchantSlug, string> = {
  vodafone: "https://www.vodafone.co.uk/",
  talkmobile: "https://talkmobile.co.uk/",
  ttfone: "https://www.ttfone.com/",
  lebara: "https://www.lebara.co.uk/",
};

interface GenerateLinkOptions {
  /** Awin merchant ID — e.g. "1257" for Vodafone */
  merchantId: string;
  /** Target URL on the merchant's site (will be URL-encoded) */
  destinationUrl: string;
  /** Optional tracking label — e.g. "homepage_banner", "compare_iphone16" */
  clickref?: string;
  /** Additional sub-IDs (Awin supports clickref, clickref2..clickref6) */
  clickref2?: string;
  clickref3?: string;
}

/**
 * Generate an Awin cread-format affiliate link.
 *
 * @example
 * generateAwinLink({
 *   merchantId: "1257",
 *   destinationUrl: "https://www.vodafone.co.uk/mobile/phones/apple-iphone-16",
 *   clickref: "compare_page",
 * })
 * // → https://www.awin1.com/cread.php?awinmid=1257&awinaffid=2798806&clickref=compare_page&ued=https%3A%2F%2Fwww.vodafone.co.uk%2Fmobile%2Fphones%2Fapple-iphone-16
 */
export function generateAwinLink({
  merchantId,
  destinationUrl,
  clickref,
  clickref2,
  clickref3,
}: GenerateLinkOptions): string {
  const params = new URLSearchParams();
  params.set("awinmid", merchantId);
  params.set("awinaffid", AWIN_AFFILIATE_ID);
  if (clickref) params.set("clickref", clickref);
  if (clickref2) params.set("clickref2", clickref2);
  if (clickref3) params.set("clickref3", clickref3);
  // `ued` MUST be URL-encoded — URLSearchParams handles this automatically
  params.set("ued", destinationUrl);

  return `https://www.awin1.com/cread.php?${params.toString()}`;
}

/**
 * Generate an Awin link by merchant slug (easier API).
 *
 * @example
 * getMerchantLink("vodafone", "https://www.vodafone.co.uk/mobile/sim-only")
 */
export function getMerchantLink(
  slug: AwinMerchantSlug,
  destinationUrl?: string,
  clickref?: string
): string {
  const merchantId = AWIN_MERCHANTS[slug];
  if (!merchantId) {
    throw new Error(`Unknown merchant: ${slug}`);
  }
  return generateAwinLink({
    merchantId,
    destinationUrl: destinationUrl || MERCHANT_HOMEPAGES[slug],
    clickref,
  });
}

/**
 * Try to detect merchant slug from a URL hostname.
 * Returns null if the URL doesn't match any known merchant.
 */
export function detectMerchantFromUrl(url: string): AwinMerchantSlug | null {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes("vodafone.co.uk")) return "vodafone";
    if (hostname.includes("talkmobile.co.uk")) return "talkmobile";
    if (hostname.includes("ttfone.com")) return "ttfone";
    if (hostname.includes("lebara")) return "lebara";
    return null;
  } catch {
    return null;
  }
}

/**
 * Wrap any merchant URL with the correct Awin tracking, auto-detecting
 * the merchant from the hostname. Returns the original URL if the
 * hostname isn't a known merchant.
 */
export function wrapWithAffiliate(
  url: string,
  clickref?: string
): string {
  const merchant = detectMerchantFromUrl(url);
  if (!merchant) return url;
  return generateAwinLink({
    merchantId: AWIN_MERCHANTS[merchant],
    destinationUrl: url,
    clickref,
  });
}
