import { categories } from "./categories";

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  description?: string;
  featured?: boolean;
}

export const mainNavItems: NavItem[] = categories.map((cat) => ({
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
    { label: "Energy", href: "/energy" },
    { label: "Broadband", href: "/broadband" },
    { label: "Mobile", href: "/mobile" },
    { label: "Insurance", href: "/insurance" },
    { label: "Finance", href: "/finance" },
    { label: "Business", href: "/business" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Contact", href: "/contact" },
    { label: "Guides", href: "/guides" },
    { label: "FAQ", href: "/faq" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/privacy#cookies" },
    { label: "Accessibility", href: "/accessibility" },
  ],
};
