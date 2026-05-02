import { activeCategories } from "./categories";

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  description?: string;
  featured?: boolean;
}

// Active comparison categories from config + curated standalone destinations.
// "Refurbished" and "Broadband" are surfaced as top-level nav even though
// they sit in different schema categories — this is the user-facing IA.
const categoryNav: NavItem[] = activeCategories.map((cat) => ({
  label: cat.name,
  href: `/${cat.slug}`,
  description: cat.description,
  children: cat.subcategories.map((sub) => ({
    label: sub.name,
    href: `/${cat.slug}/${sub.slug}`,
    description: sub.description,
  })),
}));

export const mainNavItems: NavItem[] = [
  ...categoryNav,
  {
    label: "Refurbished",
    href: "/refurbished",
    description: "Like-new phones from £99. Mozillion + multi-network sellers.",
  },
  {
    label: "Broadband",
    href: "/broadband",
    description: "Full-fibre from £29/mo. Be Fibre + speed comparison.",
  },
  {
    label: "Guides",
    href: "/guides",
    description: "Buyer guides — straight talk on contracts, refurbs and roaming.",
  },
];

export const footerLinks = {
  compare: [
    { label: "Mobile Deals", href: "/mobile" },
    { label: "Phone Contracts", href: "/mobile/contracts" },
    { label: "SIM Only", href: "/mobile/sim-only" },
    { label: "Providers", href: "/providers" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/privacy#cookies" },
    { label: "Accessibility", href: "/accessibility" },
  ],
};
