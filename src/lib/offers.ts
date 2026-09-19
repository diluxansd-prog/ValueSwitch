import {
  getMerchantLink,
  MERCHANT_HOMEPAGES,
  type AwinMerchantSlug,
} from "@/lib/affiliate";

/**
 * Curated Awin offers & voucher codes — hand-picked from the publisher
 * dashboard (Toolbox → My Offers) for advertisers we've joined.
 *
 * Static by design: no DB dependency, deploys with the site, and the
 * expiry filter in `getActiveOffers()` hides stale entries automatically.
 * Refresh this list when new promotions land in the Awin dashboard.
 *
 * Last synced with Awin: 5 September 2026.
 */

export type OfferCategory =
  | "sim"
  | "broadband"
  | "travel-esim"
  | "phones"
  | "business"
  | "insurance";

export interface CuratedOffer {
  /** Stable id, used as React key + clickref */
  id: string;
  merchant: AwinMerchantSlug;
  merchantName: string;
  title: string;
  description: string;
  /** Voucher code, when the offer needs one at checkout */
  code?: string;
  /** ISO date the offer started (from the Awin dashboard) — drives newest-first ordering */
  startsAt?: string;
  /** ISO date the offer ends — omit for long-running/evergreen offers */
  endsAt?: string;
  category: OfferCategory;
  /** Deep link target — defaults to the merchant homepage */
  destinationUrl?: string;
  /** Highest first within a category */
  priority: number;
  /** Short value label shown as the offer's badge, e.g. "50% OFF" */
  badge: string;
}

export const CURATED_OFFERS: CuratedOffer[] = [
  // ── SIM & mobile plans ────────────────────────────────────────────
  {
    id: "lebara-save50",
    startsAt: "2024-02-07",
    merchant: "lebara",
    merchantName: "Lebara",
    title: "50% off every plan for 3 months",
    description:
      "Half price on all Lebara SIM-only plans for your first 3 months — includes EU roaming and international minutes on selected plans.",
    code: "SAVE50",
    category: "sim",
    destinationUrl: "https://www.lebara.co.uk/en/best-sim-only-deals.html",
    priority: 100,
    badge: "50% OFF",
  },
  {
    id: "lebara-30gb-249",
    startsAt: "2026-01-21",
    merchant: "lebara",
    merchantName: "Lebara",
    title: "30GB SIM for £2.49/month",
    description:
      "30GB data with unlimited UK calls and texts, discounted to £2.49 a month for the first 3 months on 30-day or 12-month plans.",
    code: "LEBARA10",
    category: "sim",
    destinationUrl: "https://www.lebara.co.uk/en/best-sim-only-deals.html",
    priority: 95,
    badge: "£2.49/mo",
  },
  {
    id: "voxi-80gb",
    startsAt: "2026-07-27",
    merchant: "voxi",
    merchantName: "VOXI",
    title: "80GB + unlimited social media for £10",
    description:
      "VOXI's £10 plan now packs 80GB of data plus unlimited social media use that doesn't touch your allowance. Powered by Vodafone's network.",
    endsAt: "2027-03-31",
    category: "sim",
    destinationUrl: "https://www.voxi.co.uk/sim-only-plans",
    priority: 90,
    badge: "80GB £10",
  },
  {
    id: "voxi-300gb",
    startsAt: "2026-07-27",
    merchant: "voxi",
    merchantName: "VOXI",
    title: "300GB + unlimited video & music for £20",
    description:
      "300GB of 5G data with unlimited social media, music and video streaming for £20 a month — no contract, cancel anytime.",
    endsAt: "2027-03-31",
    category: "sim",
    destinationUrl: "https://www.voxi.co.uk/sim-only-plans",
    priority: 85,
    badge: "300GB £20",
  },
  {
    id: "vodafone-basics-100gb",
    startsAt: "2026-04-09",
    merchant: "vodafone",
    merchantName: "Vodafone",
    title: "100GB Basics plan for £12/month",
    description:
      "Vodafone's 12-month Basics SIM with 100GB of data for £12 a month — one of the cheapest big-data plans on a major UK network.",
    category: "sim",
    destinationUrl: "https://www.vodafone.co.uk/sim-only/best-sim-only-deals",
    priority: 80,
    badge: "100GB £12",
  },
  {
    id: "vodafone-basics-11gb",
    startsAt: "2026-04-09",
    merchant: "vodafone",
    merchantName: "Vodafone",
    title: "11GB Basics plan for £7/month",
    description:
      "Light-user pick: Vodafone's 12-month Basics SIM with 11GB of data for just £7 a month on the UK's most reliable network.",
    category: "sim",
    destinationUrl: "https://www.vodafone.co.uk/sim-only/best-sim-only-deals",
    priority: 75,
    badge: "11GB £7",
  },
  {
    id: "1pmobile-50gb-boost",
    startsAt: "2024-07-25",
    merchant: "1pmobile",
    merchantName: "1pMobile",
    title: "Free 50GB data boost on new SIMs",
    description:
      "Order a free 1pMobile PAYG SIM and get a 50GB data boost applied when you activate. Calls, texts and data from just 1p on EE's network.",
    code: "VASB50",
    category: "sim",
    priority: 70,
    badge: "FREE 50GB",
  },
  // NOTE: Scancom's EE/Three SIM codes (SCANCOMVIP, 20%OFFTHREE) are
  // deliberately not listed — scancom.com is a placeholder page with no
  // storefront, so the links would dead-end. Re-add once the Awin
  // deeplink for their actual shop is known.
  {
    id: "simlocal-students",
    startsAt: "2026-09-17",
    merchant: "sim-local",
    merchantName: "Sim Local",
    title: "15% student discount on SIMs",
    description:
      "Students save 15% at Sim Local — stack it with freshers-season SIM deals before it expires.",
    code: "STUDENTS15",
    endsAt: "2026-10-10",
    category: "sim",
    destinationUrl: "https://www.simlocal.com/promotions/esim-plans-for-students",
    priority: 55,
    badge: "15% OFF",
  },

  {
    id: "chattr-back-to-school",
    startsAt: "2026-09-08",
    merchant: "chattr",
    merchantName: "Chattr",
    title: "No-credit-check SIM — £15/month, £13 with loyalty",
    description:
      "Chattr's back-to-school SIM: no credit check, ideal for a student SIM or a second number. £15 a month, dropping to £13 with their loyalty discount.",
    endsAt: "2026-09-30",
    category: "sim",
    destinationUrl: "https://chattr.co.uk/plans",
    priority: 60,
    badge: "NO CREDIT CHECK",
  },

  // ── Travel insurance ──────────────────────────────────────────────
  {
    id: "outbacker-single-trip-5",
    startsAt: "2026-09-09",
    merchant: "outbacker",
    merchantName: "Outbacker Insurance",
    title: "5% off single-trip travel insurance",
    description:
      "5% off Outbacker single-trip policies — backpacker and adventure cover with medical, gadget and cancellation protection. Pairs with a travel eSIM.",
    code: "OUTBACKER5",
    endsAt: "2026-09-30",
    category: "insurance",
    destinationUrl: "https://outbackerinsurance.com/travel_insurance_quote.php",
    priority: 100,
    badge: "5% OFF",
  },

  {
    id: "mozillion-4pm-flash",
    startsAt: "2026-09-19",
    merchant: "mozillion",
    merchantName: "Mozillion",
    title: "30GB SIM for £4/month equivalent — no credit check",
    description:
      "One £96 payment covers 24 months: 30GB refreshed monthly, unlimited calls and texts, 5G, EU roaming in 41 countries. No credit check and no mid-contract price rises. Flash offer, ends Sunday midnight.",
    endsAt: "2026-09-20",
    category: "sim",
    destinationUrl: "https://www.mozillion.com/sim-detail/24346",
    priority: 120,
    badge: "£4/mo · 24 MTHS",
  },
  {
    id: "vodafone-unlimited-26",
    startsAt: "2026-09-17",
    merchant: "vodafone",
    merchantName: "Vodafone",
    title: "Unlimited data SIM — £26/month (was £39)",
    description:
      "Vodafone's unlimited SIM-only plan with 100Mbps speeds and EU roaming, cut from £39 to £26 a month — £312 saved across the 24-month term.",
    endsAt: "2026-11-11",
    category: "sim",
    destinationUrl: "https://www.vodafone.co.uk/sim-only/best-sim-only-deals",
    priority: 115,
    badge: "SAVE £312",
  },

  // ── Phones: iPhone 18 launch ──────────────────────────────────────
  {
    id: "mozillion-iphone-18-pro-max",
    startsAt: "2026-09-17",
    merchant: "mozillion",
    merchantName: "Mozillion",
    title: "iPhone 18 Pro Max — no mid-contract price rises",
    description:
      "Pre-order the iPhone 18 Pro Max on Mozillion with uncapped 5G, unlimited calls and texts, EU roaming — and a price locked for the whole contract.",
    category: "phones",
    destinationUrl: "https://www.mozillion.com/bundle/apple/iphone-18-pro-max",
    priority: 118,
    badge: "PRICE LOCKED",
  },
  {
    id: "mozillion-iphone-18-pro",
    startsAt: "2026-09-17",
    merchant: "mozillion",
    merchantName: "Mozillion",
    title: "iPhone 18 Pro — pre-order, price locked",
    description:
      "iPhone 18 Pro on Mozillion contracts with no mid-contract price rises, uncapped 5G data and inclusive EU roaming. SIM-free also available.",
    category: "phones",
    destinationUrl: "https://www.mozillion.com/bundle/apple/iphone-18-pro",
    priority: 112,
    badge: "PRICE LOCKED",
  },

  // ── Broadband ─────────────────────────────────────────────────────
  {
    id: "quickline-switch-300",
    startsAt: "2026-08-10",
    merchant: "quickline",
    merchantName: "Quickline",
    title: "Up to £300 switching reward",
    description:
      "Quickline covers up to £300 of early-termination fees when you switch to its full-fibre broadband — full fibre from £24.99/month.",
    endsAt: "2026-09-30",
    category: "broadband",
    destinationUrl: "https://quickline.co.uk/home-broadband/full-fibre-broadband/",
    priority: 100,
    badge: "£300 BACK",
  },
  {
    id: "quickline-ff1000",
    startsAt: "2026-04-07",
    merchant: "quickline",
    merchantName: "Quickline",
    title: "Full Fibre 1000 — £32.99/month",
    description:
      "Symmetric 1000Mbps download and upload for £32.99 a month — one of the cheapest gigabit packages in its coverage area.",
    endsAt: "2026-12-31",
    category: "broadband",
    destinationUrl: "https://quickline.co.uk/home-broadband/full-fibre-broadband/",
    priority: 90,
    badge: "1Gbps £32.99",
  },
  {
    id: "highland-1000-for-500",
    startsAt: "2026-08-05",
    merchant: "highland-broadband",
    merchantName: "Highland Broadband",
    title: "1000Mbps for the price of 500Mbps",
    description:
      "Double your speed for free: Highland Broadband's gigabit full fibre at the 500Mbps price, with free whole-home WiFi and parental controls.",
    endsAt: "2026-11-05",
    category: "broadband",
    destinationUrl: "https://highlandbroadband.com/broadband/",
    priority: 85,
    badge: "2× SPEED",
  },
  {
    id: "carnival-fibre-2397",
    // Awin told us this programme closes 15 Dec 2026, so the offer
    // retires itself the day before rather than dead-ending.
    endsAt: "2026-12-14",
    merchant: "carnival-internet",
    merchantName: "Carnival Internet",
    title: "Full fibre broadband from £23.97/month",
    description:
      "Carnival Internet's full-fibre packages start at £23.97 a month — check availability at your postcode.",
    category: "broadband",
    // NOTE: their /broadband path redirects oddly (landed on a gaming
    // sub-page in link audits) — homepage is the reliable entry.
    destinationUrl: "https://www.carnivalinternet.co.uk/",
    priority: 65,
    badge: "£23.97/mo",
  },
  {
    id: "lightning-fibre-sussex",
    merchant: "lightning-fibre",
    merchantName: "Lightning Fibre",
    title: "Full fibre in East Sussex from £24/month",
    description:
      "Eastbourne & Sussex full-fibre network with symmetrical speeds — plans from around £24 a month.",
    category: "broadband",
    priority: 60,
    badge: "FROM £24",
  },
  {
    id: "italk-full-fibre",
    merchant: "italk",
    merchantName: "iTalk",
    title: "Full fibre packages up to 1000Mbps",
    description:
      "iTalk's full-fibre range spans Full Fibre 115 to Full Fibre 1000, with broadband and phone bundles available.",
    category: "broadband",
    destinationUrl: "https://www.italktelecom.co.uk/broadband/full-fibre/",
    priority: 55,
    badge: "FULL FIBRE",
  },
  {
    id: "connect-fibre",
    startsAt: "2026-09-05",
    merchant: "connect-fibre",
    merchantName: "Connect Fibre",
    title: "Full-fibre broadband deals",
    description:
      "Ultrafast full-fibre packages from Connect Fibre — our newest broadband partner. Check availability at your postcode.",
    category: "broadband",
    destinationUrl: "https://www.connectfibre.co.uk/broadband-in-my-area",
    priority: 70,
    badge: "NEW PARTNER",
  },

  // ── Travel eSIMs ──────────────────────────────────────────────────
  {
    id: "knowroaming-80",
    startsAt: "2026-06-10",
    merchant: "knowroaming",
    merchantName: "KnowRoaming",
    title: "80% off global unlimited eSIMs",
    description:
      "80% off global unlimited-data travel eSIMs — no code needed, discount applied automatically at checkout.",
    endsAt: "2026-12-31",
    category: "travel-esim",
    destinationUrl: "https://www.knowroaming.com/esims/global",
    priority: 100,
    badge: "80% OFF",
  },
  {
    id: "worldsim-10",
    startsAt: "2026-09-02",
    merchant: "worldsim",
    merchantName: "WorldSIM",
    title: "10% off eSIM Pro & eSIM Connect",
    description:
      "10% off WorldSIM's eSIM Pro (with UK mobile number) and data-only eSIM Connect plans for travel anywhere.",
    code: "eSIM10",
    endsAt: "2026-10-15",
    category: "travel-esim",
    destinationUrl: "https://www.worldsim.com/international-esim-card",
    priority: 90,
    badge: "10% OFF",
  },
  {
    id: "mozillion-esim-2",
    startsAt: "2026-08-14",
    merchant: "mozillion",
    merchantName: "Mozillion",
    title: "Travel eSIMs from £2",
    description:
      "Mobile data the moment you land — one eSIM, 200+ destinations, activates automatically abroad. Plans start at just £2.",
    endsAt: "2026-09-30",
    category: "travel-esim",
    destinationUrl: "https://www.mozillion.com/travel-sim",
    priority: 80,
    badge: "FROM £2",
  },

  // ── Phones ────────────────────────────────────────────────────────
  {
    id: "fonehouse-samsung-z8-launch",
    startsAt: "2026-09-04",
    merchant: "fonehouse",
    merchantName: "Fonehouse",
    title: "New Samsung Galaxy Z Flip8 & Z Fold8 — order now",
    description:
      "Samsung's latest foldables have landed at Fonehouse: Galaxy Z Flip8, Z Fold8 and Z Fold8 Ultra, with contract deals from £15/month.",
    endsAt: "2026-10-31",
    category: "phones",
    destinationUrl: "https://www.fonehouse.co.uk/brand/samsung-mobile-phone-deals",
    priority: 110,
    badge: "JUST LAUNCHED",
  },
  {
    id: "ttfone-refurb-50",
    startsAt: "2026-02-06",
    merchant: "ttfone",
    merchantName: "TTfone",
    title: "Up to 50% off returned & open-box phones",
    description:
      "Quality returned, open-box and pre-owned simple phones for up to half price — plus free delivery on all orders.",
    endsAt: "2027-02-06",
    category: "phones",
    destinationUrl: "https://www.ttfone.com/collections/warehouse-deals",
    priority: 100,
    badge: "50% OFF",
  },
];

const VODAFONE_BUSINESS_OFFERS: CuratedOffer[] = [
  // From the Vodafone Business affiliate mailer, 18 Sep 2026. Prices
  // exclude VAT; both were verified live before listing.
  {
    id: "vodafone-biz-iphone-18-pro-max",
    startsAt: "2026-09-18",
    merchant: "vodafone",
    merchantName: "Vodafone Business",
    title: "iPhone 18 Pro Max for Business — £59.33/month",
    description:
      "iPhone 18 Pro Max 256GB on a SuperMobile Plus plan: £59.33 a month with £41.67 upfront (exc. VAT), on a 24-month airtime and 48-month phone plan. Terms apply.",
    category: "business",
    destinationUrl:
      "https://www.vodafone.co.uk/business/business-mobile-phones/pay-monthly-contracts/apple/iphone-18-pro-max",
    priority: 120,
    badge: "iPhone 18 PRO MAX",
  },
  {
    id: "vodafone-biz-iphone-18-pro",
    startsAt: "2026-09-18",
    merchant: "vodafone",
    merchantName: "Vodafone Business",
    title: "iPhone 18 Pro for Business — £57.63/month",
    description:
      "iPhone 18 Pro 256GB on a SuperMobile plan with up to 4x faster speeds: £57.63 a month, £33.33 upfront (exc. VAT), 24-month airtime with a 48-month phone plan. Terms apply.",
    category: "business",
    destinationUrl:
      "https://www.vodafone.co.uk/business/business-mobile-phones/pay-monthly-contracts/apple/iphone-18-pro",
    priority: 118,
    badge: "iPhone 18 PRO",
  },
  // From the Awin Vodafone Business affiliate mailer, 26 Aug 2026.
  // Business offers don't flow through the consumer feed or the
  // Promotions API — email is their only channel. Prices exclude VAT.
  {
    id: "vodafone-biz-unlimited-simo",
    startsAt: "2026-08-26",
    merchant: "vodafone",
    merchantName: "Vodafone Business",
    title: "Business Unlimited SIM — £19.17/month (save £240)",
    description:
      "Save £240 on Vodafone's business Unlimited SIM-only plan at £19.17 a month (exc. VAT; rises £21.25 from April 2027). Terms apply.",
    endsAt: "2026-09-16",
    category: "business",
    destinationUrl: "https://www.vodafone.co.uk/business/business-sim-only",
    priority: 100,
    badge: "SAVE £240",
  },
  {
    id: "vodafone-biz-pixel-11-pro",
    startsAt: "2026-08-26",
    merchant: "vodafone",
    merchantName: "Vodafone Business",
    title: "Pixel 11 Pro — save £1,220 with trade-in",
    description:
      "Save £1,220 on the Google Pixel 11 Pro 256GB when you trade in an eligible phone, on a 24-month Unlimited Airtime + 36-month Phone Plan. From £37.91/month, £41.67 upfront (exc. VAT). Terms apply.",
    endsAt: "2026-09-09",
    category: "business",
    destinationUrl:
      "https://www.vodafone.co.uk/business/business-mobile-phones/pay-monthly-contracts/google/pixel-11-pro",
    priority: 95,
    badge: "SAVE £1,220",
  },
  {
    id: "vodafone-biz-iphone-17-pro-max",
    startsAt: "2026-08-26",
    merchant: "vodafone",
    merchantName: "Vodafone Business",
    title: "iPhone 17 Pro Max — save up to £495 with trade-in",
    description:
      "Save up to £495 on the iPhone 17 Pro Max 256GB when you trade in an eligible phone. From £47.50/month with £41.67 upfront (exc. VAT). Terms apply.",
    endsAt: "2026-09-09",
    category: "business",
    destinationUrl:
      "https://www.vodafone.co.uk/business/business-mobile-phones/pay-monthly-contracts/apple/iphone-17-pro-max",
    priority: 90,
    badge: "SAVE £495",
  },
];
CURATED_OFFERS.push(...VODAFONE_BUSINESS_OFFERS);

export const OFFER_CATEGORY_LABELS: Record<OfferCategory, string> = {
  sim: "SIM & mobile plans",
  broadband: "Broadband",
  "travel-esim": "Travel eSIMs",
  phones: "Phones",
  business: "Business",
  insurance: "Travel insurance",
};

/** Offers still in date, sorted by category then priority. */
export function getActiveOffers(now: Date = new Date()): CuratedOffer[] {
  return CURATED_OFFERS.filter(
    (o) => !o.endsAt || new Date(`${o.endsAt}T23:59:59Z`) >= now
  ).sort((a, b) => b.priority - a.priority);
}

/** Tracked Awin link for an offer (cread format, clickref = offer id). */
export function getOfferLink(offer: CuratedOffer): string {
  return getMerchantLink(
    offer.merchant,
    offer.destinationUrl || MERCHANT_HOMEPAGES[offer.merchant],
    `offers_${offer.id}`
  );
}
