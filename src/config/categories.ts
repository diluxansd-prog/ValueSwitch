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
}

export const categories: CategoryConfig[] = [
  {
    name: "Energy",
    slug: "energy",
    description: "Compare gas & electricity deals",
    icon: Zap,
    color: "text-yellow-500",
    gradient: "from-yellow-500 to-orange-500",
    subcategories: [
      { name: "Gas & Electricity", slug: "gas-electricity", description: "Compare dual fuel tariffs" },
      { name: "Gas Only", slug: "gas", description: "Compare gas-only deals" },
      { name: "Electricity Only", slug: "electricity", description: "Compare electricity tariffs" },
      { name: "Green Energy", slug: "green-energy", description: "100% renewable energy tariffs" },
    ],
    heroTitle: "Compare Energy Deals & Save",
    heroDescription: "Find cheaper gas and electricity tariffs. The average household saves £312 per year by switching.",
    averageSavings: "£312",
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
      { name: "Broadband Only", slug: "broadband-only", description: "Standalone broadband deals" },
      { name: "Speed Test", slug: "speed-test", description: "Test your current broadband speed" },
    ],
    heroTitle: "Compare Broadband Deals",
    heroDescription: "Find the fastest broadband at the best price. Save up to £329 per year by switching provider.",
    averageSavings: "£329",
  },
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
      { name: "Pay As You Go", slug: "pay-as-you-go", description: "Flexible PAYG deals" },
    ],
    heroTitle: "Compare Mobile Deals",
    heroDescription: "Find the perfect mobile phone deal. Compare SIM only and contract deals from all major networks.",
    averageSavings: "£168",
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
      { name: "Pet Insurance", slug: "pet", description: "Protect your pets" },
      { name: "Travel Insurance", slug: "travel", description: "Cover for your holidays" },
    ],
    heroTitle: "Compare Insurance Quotes",
    heroDescription: "Get the best insurance deals. Compare quotes from leading UK insurers in minutes.",
    averageSavings: "£247",
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
      { name: "Mortgages", slug: "mortgages", description: "Find the best mortgage deals" },
      { name: "Savings Accounts", slug: "savings", description: "Best savings rates" },
    ],
    heroTitle: "Compare Financial Products",
    heroDescription: "Find the best credit cards, loans, and savings accounts. Make your money work harder.",
    averageSavings: "£195",
  },
  {
    name: "Business",
    slug: "business",
    description: "Business comparison services",
    icon: Building2,
    color: "text-slate-600",
    gradient: "from-slate-600 to-slate-800",
    subcategories: [
      { name: "Business Energy", slug: "energy", description: "Compare business energy rates" },
      { name: "Business Broadband", slug: "broadband", description: "Business broadband deals" },
      { name: "Business Finance", slug: "finance", description: "Business loans and finance" },
    ],
    heroTitle: "Compare Business Services",
    heroDescription: "Save on your business energy, broadband and finance. Tailored comparison for UK businesses.",
    averageSavings: "£485",
  },
];

export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  return categories.find((c) => c.slug === slug);
}
