import type { Metadata } from "next";

export const siteConfig = {
  name: "ValueSwitch",
  description: "Compare and switch to save money on energy, broadband, mobile, insurance and more. Free, impartial price comparison for UK households and businesses.",
  url: "https://valueswitch.co.uk",
  ogImage: "/images/og-default.png",
};

export const defaultMetadata: Metadata = {
  title: {
    default: "ValueSwitch - Compare & Save on Energy, Broadband, Mobile & More",
    template: "%s | ValueSwitch",
  },
  description: siteConfig.description,
  keywords: [
    "price comparison", "compare energy", "compare broadband", "switch energy supplier",
    "cheap broadband", "mobile phone deals", "car insurance comparison", "UK comparison",
  ],
  authors: [{ name: "ValueSwitch" }],
  creator: "ValueSwitch",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: siteConfig.url,
    title: "ValueSwitch - Compare & Save",
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: "ValueSwitch - Compare & Save",
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};
