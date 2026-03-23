import { Zap, Wifi, Smartphone, Shield, PiggyBank, Building2 } from "lucide-react";

export type CategorySlug = "energy" | "broadband" | "mobile" | "insurance" | "finance" | "business";

export interface SubCategory {
  name: string;
  slug: string;
  description: string;
}

export interface CategoryConfig {
  name: string;
  slug: CategorySlug;
  description: string;
  icon: any;
  color: string;
  gradient: string;
  subcategories: SubCategory[];
  heroTitle: string;
  heroDescription: string;
  averageSavings: string;
  isActive: boolean;
  comingSoon?: boolean;
}

// Only Mobile is live with real data right now
export const categories: CategoryConfig[] = [
  {
    name: "Mobile",
    slug: "mobile",
    description: "Compare mobile phone deals",
    icon: Smartphone,
    color: "text-purple-500",
    gradient: "from-purple-500 to-pink-500",
    subcategories: [
      { name: "SIM Only", slug: "sim-only", description: "Keep your phone, get a new SIM deal" },
      { name: "Phone Contracts", slug: "contracts", description: "New phone with a monthly contract" },
    ],
    heroTitle: "Compare Mobile Deals",
    heroDescription: "Find the perfect mobile phone deal. Compare real deals from Vodafone with affiliate pricing you can trust.",
    averageSavings: "£168",
    isActive: true,
  },
  {
    name: "Energy",
    slug: "energy",
    description: "Compare gas & electricity deals",
    icon: Zap,
    color: "text-yellow-500",
    gradient: "from-yellow-500 to-orange-500",
    subcategories: [
      { name: "Gas & Electricity", slug: "gas-electricity", description: "Compare dual fuel tariffs" },
      { name: "Green Energy", slug: "green-energy", description: "100% renewable energy tariffs" },
    ],
    heroTitle: "Compare Energy Deals & Save",
    heroDescription: "Find cheaper gas and electricity tariffs.",
    averageSavings: "£312",
    isActive: false,
    comingSoon: true,
  },
  {
    name: "Broadband",
    slug: "broadband",
    description: "Find the best broadband deals",
    icon: Wifi,
    color: "text-blue-500",
    gradient: "from-blue-500 to-cyan-500",
    subcategories: [
      { name: "Fibre Broadband", slug: "fibre", description: "Superfast fibre optic deals" },
      { name: "Broadband & TV", slug: "tv-packages", description: "Bundle broadband with TV packages" },
    ],
    heroTitle: "Compare Broadband Deals",
    heroDescription: "Find the fastest broadband at the best price.",
    averageSavings: "£329",
    isActive: false,
    comingSoon: true,
  },
  {
    name: "Insurance",
    slug: "insurance",
    description: "Compare insurance quotes",
    icon: Shield,
    color: "text-green-500",
    gradient: "from-green-500 to-emerald-500",
    subcategories: [
      { name: "Car Insurance", slug: "car", description: "Compare car insurance quotes" },
      { name: "Home Insurance", slug: "home", description: "Buildings and contents insurance" },
    ],
    heroTitle: "Compare Insurance Quotes",
    heroDescription: "Get the best insurance deals.",
    averageSavings: "£247",
    isActive: false,
    comingSoon: true,
  },
  {
    name: "Finance",
    slug: "finance",
    description: "Compare financial products",
    icon: PiggyBank,
    color: "text-emerald-500",
    gradient: "from-emerald-500 to-teal-500",
    subcategories: [
      { name: "Credit Cards", slug: "credit-cards", description: "0% cards, rewards & cashback" },
      { name: "Personal Loans", slug: "loans", description: "Compare personal loan rates" },
    ],
    heroTitle: "Compare Financial Products",
    heroDescription: "Find the best credit cards, loans, and savings accounts.",
    averageSavings: "£195",
    isActive: false,
    comingSoon: true,
  },
];

export const activeCategories = categories.filter((c) => c.isActive);
export const comingSoonCategories = categories.filter((c) => c.comingSoon);

export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  return categories.find((c) => c.slug === slug);
}
