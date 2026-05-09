/**
 * Curated UK city list for programmatic broadband landing pages.
 *
 * Selection criteria — kept these tight on purpose:
 *   - Population ≥ 200k (avoids dilution at the long tail)
 *   - Distinct full-fibre coverage signals from at least one altnet
 *   - Real organic search volume per Google Keyword Planner (UK)
 *
 * `slug` is what appears in the URL.  `name` is the headline used in
 * H1 / metadata.  `region` lets us hand-author rough coverage notes
 * per city (some are altnet hotspots, some are Openreach-only).
 *
 * Adding a new city = one row.  Don't expand past ~30 — beyond that
 * the long tail dilutes individual page authority.
 */

export interface UkCity {
  slug: string;
  /** Display name used in title/H1 */
  name: string;
  /** UK region for coverage context */
  region: string;
  /** Approximate population (2024 ONS estimate) */
  population: number;
  /** Honest coverage description used in the hero copy */
  coverage: string;
  /** Local altnet (if any) that has substantial footprint */
  altnet?: string;
  /** Postcode prefix(es) the page should call out */
  postcodes: string[];
}

export const UK_CITIES: UkCity[] = [
  {
    slug: "london",
    name: "London",
    region: "Greater London",
    population: 9_000_000,
    coverage:
      "Full-fibre is now in 84% of London postcodes. Community Fibre, Hyperoptic and CityFibre lead the altnet build; Openreach covers most boroughs.",
    altnet: "Community Fibre",
    postcodes: ["E", "EC", "N", "NW", "SE", "SW", "W", "WC"],
  },
  {
    slug: "manchester",
    name: "Manchester",
    region: "Greater Manchester",
    population: 552_000,
    coverage:
      "One of the UK's strongest altnet markets. CityFibre and Be Fibre have full-fibre across most of the city; Openreach covers the surrounding boroughs.",
    altnet: "CityFibre / Be Fibre",
    postcodes: ["M1", "M2", "M3", "M4", "M14", "M20"],
  },
  {
    slug: "birmingham",
    name: "Birmingham",
    region: "West Midlands",
    population: 1_150_000,
    coverage:
      "Full-fibre coverage hit 79% of Birmingham postcodes in early 2026. Be Fibre and CityFibre cover most central postcodes.",
    altnet: "Be Fibre",
    postcodes: ["B1", "B2", "B3", "B4", "B5", "B12", "B16"],
  },
  {
    slug: "leeds",
    name: "Leeds",
    region: "West Yorkshire",
    population: 800_000,
    coverage:
      "Be Fibre and CityFibre have substantial city-centre footprint. LS1-LS6 are well covered; outlying postcodes still primarily Openreach.",
    altnet: "Be Fibre",
    postcodes: ["LS1", "LS2", "LS3", "LS4", "LS6"],
  },
  {
    slug: "glasgow",
    name: "Glasgow",
    region: "Scotland",
    population: 633_000,
    coverage:
      "Strong Openreach FTTP footprint city-wide. CityFibre is rolling out in the Southside and West End; Hyperoptic covers select apartment blocks.",
    altnet: "CityFibre",
    postcodes: ["G1", "G2", "G3", "G4", "G11", "G12"],
  },
  {
    slug: "edinburgh",
    name: "Edinburgh",
    region: "Scotland",
    population: 530_000,
    coverage:
      "Openreach Full Fibre covers most of central Edinburgh. Hyperoptic is in select New Town blocks; CityFibre rolling into the south of the city.",
    postcodes: ["EH1", "EH2", "EH3", "EH8", "EH9", "EH10"],
  },
  {
    slug: "liverpool",
    name: "Liverpool",
    region: "Merseyside",
    population: 500_000,
    coverage:
      "Full-fibre availability is around 76% city-wide. Be Fibre and CityFibre have strong central coverage; outlying postcodes Openreach-only.",
    altnet: "Be Fibre",
    postcodes: ["L1", "L2", "L3", "L7", "L8", "L17"],
  },
  {
    slug: "bristol",
    name: "Bristol",
    region: "South West",
    population: 470_000,
    coverage:
      "Openreach FTTP covers most of Bristol. Truespeed is the main altnet in the surrounding Somerset villages; central Bristol is well-served by both.",
    altnet: "Truespeed",
    postcodes: ["BS1", "BS2", "BS3", "BS5", "BS6", "BS8"],
  },
  {
    slug: "sheffield",
    name: "Sheffield",
    region: "South Yorkshire",
    population: 555_000,
    coverage:
      "CityFibre has strong footprint here. Most central postcodes have at least 2 full-fibre options; outer postcodes Openreach-only.",
    altnet: "CityFibre",
    postcodes: ["S1", "S2", "S3", "S6", "S7", "S10"],
  },
  {
    slug: "newcastle",
    name: "Newcastle",
    region: "North East",
    population: 300_000,
    coverage:
      "Openreach Full Fibre covers most of Newcastle. CityFibre has rolled out across the city centre and Gosforth.",
    altnet: "CityFibre",
    postcodes: ["NE1", "NE2", "NE3", "NE4", "NE6"],
  },
  {
    slug: "nottingham",
    name: "Nottingham",
    region: "East Midlands",
    population: 332_000,
    coverage:
      "Be Fibre and CityFibre both have strong Nottingham presence. Most central postcodes have 2+ full-fibre options.",
    altnet: "Be Fibre",
    postcodes: ["NG1", "NG2", "NG3", "NG7"],
  },
  {
    slug: "cardiff",
    name: "Cardiff",
    region: "Wales",
    population: 372_000,
    coverage:
      "Openreach FTTP covers most of Cardiff. Ogi (Welsh altnet) is rolling out in select postcodes; CityFibre has central coverage.",
    altnet: "Ogi",
    postcodes: ["CF10", "CF11", "CF14", "CF24"],
  },
  {
    slug: "belfast",
    name: "Belfast",
    region: "Northern Ireland",
    population: 345_000,
    coverage:
      "Fibrus is the main altnet across Northern Ireland. Belfast city centre is well-covered by both Fibrus and Openreach.",
    altnet: "Fibrus",
    postcodes: ["BT1", "BT7", "BT9", "BT12"],
  },
  {
    slug: "leicester",
    name: "Leicester",
    region: "East Midlands",
    population: 368_000,
    coverage:
      "CityFibre has rolled out across Leicester city centre. Openreach FTTP covers most of the surrounding postcodes.",
    altnet: "CityFibre",
    postcodes: ["LE1", "LE2", "LE3", "LE4"],
  },
  {
    slug: "coventry",
    name: "Coventry",
    region: "West Midlands",
    population: 372_000,
    coverage:
      "CityFibre is the dominant altnet in Coventry. Most central postcodes have full-fibre via at least one provider.",
    altnet: "CityFibre",
    postcodes: ["CV1", "CV2", "CV3", "CV4", "CV6"],
  },
  {
    slug: "southampton",
    name: "Southampton",
    region: "South East",
    population: 270_000,
    coverage:
      "Openreach Full Fibre covers most of Southampton. CityFibre rolling out in select areas.",
    altnet: "CityFibre",
    postcodes: ["SO14", "SO15", "SO16", "SO17"],
  },
  {
    slug: "portsmouth",
    name: "Portsmouth",
    region: "South East",
    population: 213_000,
    coverage:
      "Openreach FTTP and Toob both cover central Portsmouth. Toob (local altnet) often has the best price-per-Mbps in supported postcodes.",
    altnet: "Toob",
    postcodes: ["PO1", "PO2", "PO3", "PO5"],
  },
  {
    slug: "brighton",
    name: "Brighton",
    region: "South East",
    population: 277_000,
    coverage:
      "Openreach FTTP is widely available. CityFibre and Hyperoptic have presence in central Brighton; outer Hove postcodes Openreach-only.",
    altnet: "CityFibre",
    postcodes: ["BN1", "BN2", "BN3"],
  },
  {
    slug: "reading",
    name: "Reading",
    region: "South East",
    population: 175_000,
    coverage:
      "Heavy Openreach FTTP coverage. Hyperoptic in select town-centre apartment blocks; YouFibre and BRSK (local altnet) covering parts of suburbia.",
    altnet: "BRSK",
    postcodes: ["RG1", "RG2", "RG30"],
  },
  {
    slug: "milton-keynes",
    name: "Milton Keynes",
    region: "South East",
    population: 230_000,
    coverage:
      "Strong altnet market. CityFibre has city-wide rollout; Openreach FTTP covers most postcodes; Voneus in surrounding villages.",
    altnet: "CityFibre",
    postcodes: ["MK2", "MK3", "MK4", "MK6", "MK9", "MK14"],
  },
];

export function getCityBySlug(slug: string): UkCity | undefined {
  return UK_CITIES.find((c) => c.slug === slug);
}
