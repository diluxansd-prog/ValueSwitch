import type { Metadata } from "next";

export const siteConfig = {
  name: "ValueSwitch",
  description: "Compare real mobile phone deals from Vodafone, Talkmobile, TTfone and Lebara. Real prices, verified affiliate links. UK price comparison.",
  url: "https://valueswitch.co.uk",
  ogImage: "/images/og-default.png",
};

export const defaultMetadata: Metadata = {
  title: {
    default: "ValueSwitch - Compare Real Mobile Phone Deals",
    template: "%s | ValueSwitch",
  },
  description: siteConfig.description,
  keywords: [
    "mobile phone deals", "compare mobile deals", "Vodafone deals", "phone contracts UK",
    "SIM only deals", "cheap mobile deals", "Talkmobile", "Lebara deals", "UK mobile comparison",
  ],
  authors: [{ name: "ValueSwitch" }],
  creator: "ValueSwitch",
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: siteConfig.url,
    title: "ValueSwitch - Compare & Save",
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [{ url: `${siteConfig.url}${siteConfig.ogImage}`, width: 1200, height: 630, alt: "ValueSwitch - Compare & Save" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ValueSwitch - Compare & Save",
    description: siteConfig.description,
    images: [`${siteConfig.url}${siteConfig.ogImage}`],
  },
  robots: {
    index: true,
    follow: true,
  },
};
