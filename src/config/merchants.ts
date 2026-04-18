/**
 * Registry of Awin merchant feeds.
 *
 * Add a new partner by:
 *   1. Dropping a new entry below.
 *   2. Setting its feedUrlEnv on Vercel (or leaving unset — cron will skip
 *      merchants without a feed URL, no code change needed).
 *
 * The cron at /api/cron/refresh-feed iterates this list weekly and
 * imports every merchant whose feed URL env var is set.
 */

export interface MerchantFeedConfig {
  /** Provider.slug in Prisma (must already exist in DB) */
  slug: string;
  /** Human name for logs + admin UI */
  name: string;
  /** Awin MID — used to generate cread-format affiliate links */
  awinMerchantId: string;
  /** Env var that holds the gzipped-CSV download URL from Awin dashboard */
  feedUrlEnv: string;
  /**
   * Stable landing pages on the merchant site that always return 200.
   * We point plans here instead of using the feed's product-level deep
   * links, which expire when Vodafone/etc retire an SKU.
   */
  landingPages: {
    handset: string;
    simOnly: string;
  };
  /** Category + subcategory to tag imported plans with */
  category: "mobile" | "broadband" | "energy";
}

export const MERCHANT_FEEDS: MerchantFeedConfig[] = [
  {
    slug: "vodafone",
    name: "Vodafone",
    awinMerchantId: "1257",
    feedUrlEnv: "AWIN_VODAFONE_FEED_URL",
    landingPages: {
      handset: "https://www.vodafone.co.uk/mobile/phones",
      simOnly: "https://www.vodafone.co.uk/mobile/best-sim-only-deals",
    },
    category: "mobile",
  },
  {
    slug: "talkmobile",
    name: "Talkmobile",
    awinMerchantId: "2351",
    feedUrlEnv: "AWIN_TALKMOBILE_FEED_URL",
    landingPages: {
      handset: "https://talkmobile.co.uk/",
      simOnly: "https://talkmobile.co.uk/sim-only-deals",
    },
    category: "mobile",
  },
  {
    slug: "lebara",
    name: "Lebara",
    awinMerchantId: "30681",
    feedUrlEnv: "AWIN_LEBARA_FEED_URL",
    landingPages: {
      handset: "https://www.lebara.co.uk/en/mobile/plans.html",
      simOnly: "https://www.lebara.co.uk/en/mobile/plans/sim-only-plans.html",
    },
    category: "mobile",
  },
  // Future examples — add env vars on Vercel and they auto-onboard:
  // {
  //   slug: "ee", name: "EE", awinMerchantId: "1599",
  //   feedUrlEnv: "AWIN_EE_FEED_URL",
  //   landingPages: { handset: "https://ee.co.uk/mobile", simOnly: "https://ee.co.uk/mobile/sim-only" },
  //   category: "mobile",
  // },
];

/** Return only merchants whose feed URL is configured in env. */
export function getActiveMerchantFeeds(): Array<
  MerchantFeedConfig & { feedUrl: string }
> {
  return MERCHANT_FEEDS.flatMap((m) => {
    const url = process.env[m.feedUrlEnv];
    return url ? [{ ...m, feedUrl: url }] : [];
  });
}
