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
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Search Console verification — reads from env so you can paste the
  // verification codes from the dashboard without editing code:
  //   GOOGLE_SITE_VERIFICATION=<token from Search Console "HTML tag" method>
  //   BING_SITE_VERIFICATION=<token from Bing Webmaster Tools>
  //
  // Paste ONLY the token (the `content="..."` value), NOT the whole meta
  // tag. extractToken() strips the wrapping tag if the user pastes too
  // much — fail-safe against the #1 mistake on this integration.
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION && {
      google: extractToken(process.env.GOOGLE_SITE_VERIFICATION),
    }),
    ...(process.env.BING_SITE_VERIFICATION && {
      other: { "msvalidate.01": extractToken(process.env.BING_SITE_VERIFICATION) },
    }),
  },
};

/**
 * Extract the verification token from whatever the user pasted.
 *
 *   "ABC123..."                                    → "ABC123..."
 *   '<meta name="..." content="ABC123..." />'      → "ABC123..."
 *   ' content="ABC123..." '                        → "ABC123..."
 */
function extractToken(raw: string): string {
  const trimmed = raw.trim();
  const match = trimmed.match(/content\s*=\s*["']?([^"'\s>]+)/i);
  if (match) return match[1];
  return trimmed.replace(/^["']|["']$/g, "");
}
