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
  category: "mobile" | "broadband" | "energy" | "automotive";
  /**
   * If true, the cron skips this merchant — useful for partners we're
   * approved with but haven't built UI for yet (e.g. tyres on a phone
   * comparison site).  Affiliate link generation still works.
   */
  cronSkip?: boolean;
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
  {
    // Fonehouse (KTM Online Limited) — multi-network phone retailer.
    // Carries deals from EE, O2, Three, Vodafone, Sky Mobile, iD Mobile.
    // Approved 2026-04 by Elizabeth Price (Marketing Assistant).
    slug: "fonehouse",
    name: "Fonehouse",
    awinMerchantId: "6224",
    feedUrlEnv: "AWIN_FONEHOUSE_FEED_URL",
    landingPages: {
      handset: "https://www.fonehouse.co.uk/mobile-phones",
      simOnly: "https://www.fonehouse.co.uk/sim-only",
    },
    category: "mobile",
  },
  {
    // Be Fibre — UK full-fibre broadband ISP. Approved 2026-04.
    // Fits the "broadband" category that's already in the schema; will
    // surface on /broadband once we build that listing UI.
    slug: "be-fibre",
    name: "Be Fibre",
    awinMerchantId: "60791",
    feedUrlEnv: "AWIN_BEFIBRE_FEED_URL",
    landingPages: {
      handset: "https://www.befibre.co.uk/",
      simOnly: "https://www.befibre.co.uk/", // not applicable to broadband
    },
    category: "broadband",
  },
  {
    // Tirendo UK — online tyre retailer. Approved 2026-04.
    // Off-niche for a price comparison site (cars vs household bills),
    // so cronSkip=true keeps the affiliate relationship alive without
    // polluting the catalogue.  Use admin /admin/links to generate
    // ad-hoc Tirendo links manually if a campaign opportunity comes up.
    slug: "tirendo-uk",
    name: "Tirendo UK",
    awinMerchantId: "15112",
    feedUrlEnv: "AWIN_TIRENDO_FEED_URL",
    landingPages: {
      handset: "https://www.tirendo.co.uk/",
      simOnly: "https://www.tirendo.co.uk/",
    },
    category: "automotive",
    cronSkip: true,
  },
  {
    // Mozillion — UK refurbished phone marketplace + phone contracts.
    // Approved 2026-04. Stocks all major brands incl. Apple, Samsung, Google,
    // both SIM-free handsets and pay-monthly contracts.
    // Active promo (May 1-4 2026): £25 off any phone with code MAYDAY25.
    slug: "mozillion",
    name: "Mozillion",
    awinMerchantId: "31539",
    feedUrlEnv: "AWIN_MOZILLION_FEED_URL",
    landingPages: {
      handset: "https://www.mozillion.com/search-phone",
      simOnly: "https://www.mozillion.com/search-phone",
    },
    category: "mobile",
  },
  {
    // Grade Mobile — biggest catalogue of any partner so far (53k+ rows).
    // Multi-network phone retailer like Fonehouse but with even more variants.
    // Approved 2026-05.
    slug: "grade-mobile",
    name: "Grade Mobile",
    awinMerchantId: "22069",
    feedUrlEnv: "AWIN_GRADE_FEED_URL",
    landingPages: {
      handset: "https://www.grademobile.co.uk/",
      simOnly: "https://www.grademobile.co.uk/sim-only-deals",
    },
    category: "mobile",
  },
  {
    // Your Co-op Mobile & Broadband — co-operative provider, ethical brand.
    // Approved 2026-05.  No CSV product feed yet — provider record exists
    // for /admin/links generator + future onboarding.
    slug: "yourcoop",
    name: "Your Co-op Mobile & Broadband",
    awinMerchantId: "30943",
    feedUrlEnv: "AWIN_YOURCOOP_FEED_URL",
    landingPages: {
      handset: "https://www.yourcoop.coop/",
      simOnly: "https://www.yourcoop.coop/mobile/sim-only-plans",
    },
    category: "mobile",
    cronSkip: true, // re-enable when their feed becomes available
  },
  {
    // TTfone — senior-friendly phones (big buttons, simple UI).
    // Already had provider record from earlier; re-enabled for cron.
    slug: "ttfone",
    name: "TTfone",
    awinMerchantId: "28737",
    feedUrlEnv: "AWIN_TTFONE_FEED_URL",
    landingPages: {
      handset: "https://www.ttfone.com/",
      simOnly: "https://www.ttfone.com/",
    },
    category: "mobile",
  },
  {
    // Sim Local — global travel SIMs.  Niche but valuable for a "travel
    // SIM" comparison sub-page if we build one.  Skip from main mobile
    // listings (data-only / international SIMs aren't UK contracts).
    slug: "sim-local",
    name: "Sim Local",
    awinMerchantId: "68844",
    feedUrlEnv: "AWIN_SIMLOCAL_FEED_URL",
    landingPages: {
      handset: "https://www.simlocal.com/",
      simOnly: "https://www.simlocal.com/",
    },
    category: "mobile",
    cronSkip: true,
  },
  {
    // 1pMobile — pay-as-you-go network on EE.
    slug: "1pmobile",
    name: "1pMobile",
    awinMerchantId: "37738",
    feedUrlEnv: "AWIN_1PMOBILE_FEED_URL",
    landingPages: {
      handset: "https://1pmobile.com/",
      simOnly: "https://1pmobile.com/sim-card-bundles/",
    },
    category: "mobile",
  },
  {
    // Ecotalk — sustainable mobile network, profits to wildlife charities.
    slug: "ecotalk",
    name: "Ecotalk",
    awinMerchantId: "114718",
    feedUrlEnv: "AWIN_ECOTALK_FEED_URL",
    landingPages: {
      handset: "https://www.ecotalk.co.uk/",
      simOnly: "https://www.ecotalk.co.uk/plans",
    },
    category: "mobile",
  },
];

/** Return only merchants whose feed URL is configured in env. */
export function getActiveMerchantFeeds(): Array<
  MerchantFeedConfig & { feedUrl: string }
> {
  return MERCHANT_FEEDS.flatMap((m) => {
    if (m.cronSkip) return [];
    const url = process.env[m.feedUrlEnv];
    return url ? [{ ...m, feedUrl: url }] : [];
  });
}
