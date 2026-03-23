import { activeCategories } from "./categories";

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  description?: string;
  featured?: boolean;
}

// Only show active categories in nav (currently Mobile only)
export const mainNavItems: NavItem[] = activeCategories.map((cat) => ({
  label: cat.name,
  href: `/${cat.slug}`,
  description: cat.description,
  children: cat.subcategories.map((sub) => ({
    label: sub.name,
    href: `/${cat.slug}/${sub.slug}`,
    description: sub.description,
  })),
}));

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
