export interface ComparisonQuery {
  category: string;
  subcategory?: string;
  postcode?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  page: number;
  perPage: number;
  filters: Record<string, unknown>;
}

export interface ComparisonResult {
  plans: PlanWithProvider[];
  totalCount: number;
  page: number;
  perPage: number;
  metadata: {
    cheapestPrice: number;
    averagePrice: number;
    totalProviders: number;
  };
}

export interface PlanWithProvider {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  monthlyCost: number;
  annualCost: number | null;
  setupFee: number;
  contractLength: number | null;
  features: string[];
  rating: number | null;
  isPromoted: boolean;
  isBestValue: boolean;
  isPopular: boolean;
  // Energy
  unitRate: number | null;
  standingCharge: number | null;
  greenEnergy: boolean;
  tariffType: string | null;
  // Broadband
  downloadSpeed: number | null;
  uploadSpeed: number | null;
  dataLimit: string | null;
  includesTV: boolean;
  // Mobile
  dataAllowance: string | null;
  minutes: string | null;
  texts: string | null;
  networkType: string | null;
  includesHandset: boolean;
  handsetModel: string | null;
  // Insurance
  coverLevel: string | null;
  excessAmount: number | null;
  // Finance
  apr: number | null;
  interestRate: number | null;
  creditLimit: number | null;
  introRate: number | null;
  introRatePeriod: number | null;
  provider: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    trustScore: number | null;
    reviewCount: number;
  };
}
