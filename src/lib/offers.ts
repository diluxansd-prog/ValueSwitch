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

export type OfferCategory = "sim" | "broadband" | "travel-esim" | "phones";

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
    startsAt: "2026-08-20",
    merchant: "sim-local",
    merchantName: "Sim Local",
    title: "15% student discount on SIMs",
    description:
      "Students save 15% at Sim Local — stack it with freshers-season SIM deals before it expires.",
    code: "STUDENTS15",
    endsAt: "2026-09-15",
    category: "sim",
    destinationUrl: "https://www.simlocal.com/promotions/esim-plans-for-students",
    priority: 55,
    badge: "15% OFF",
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
    id: "be-fibre-from-20",
    merchant: "be-fibre",
    merchantName: "Be Fibre",
    title: "Symmetrical full fibre from £20/month",
    description:
      "Be Fibre's Be200 plan: 200Mbps download AND upload for £20 a month for the first 12 months. Gigabit and 2.3Gbps tiers also available.",
    category: "broadband",
    destinationUrl: "https://be-fibre.co.uk/",
    priority: 80,
    badge: "£20/mo",
  },
  {
    id: "carnival-fibre-2397",
    merchant: "carnival-internet",
    merchantName: "Carnival Internet",
    title: "Full fibre broadband from £23.97/month",
    description:
      "Carnival Internet's full-fibre packages start at £23.97 a month — check availability at your postcode.",
    category: "broadband",
    destinationUrl: "https://www.carnivalinternet.co.uk/broadband",
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

export const OFFER_CATEGORY_LABELS: Record<OfferCategory, string> = {
  sim: "SIM & mobile plans",
  broadband: "Broadband",
  "travel-esim": "Travel eSIMs",
  phones: "Phones",
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
