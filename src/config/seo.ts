import type { Metadata } from "next";

export const siteConfig = {
  name: "ValueSwitch",
  description: "Compare UK phone contracts, SIM-only plans and broadband deals. Explore partner promotions, upfront costs and contract terms with ValueSwitch.",
  url: "https://valueswitch.co.uk",
  ogImage: "/opengraph-image",
};

// Social/share titles — keep between 50-60 chars for optimal preview
// display on Facebook, X, LinkedIn, WhatsApp, Discord, iMessage, Slack.
const SHARE_TITLE = "Compare UK Mobile Phone Deals & SIM Only | ValueSwitch"; // 54 chars
const SHARE_DESC =
  "Compare UK phone contracts, SIM-only plans and broadband deals. Explore iPhone offers, voucher codes, upfront costs and contract terms. Free to compare.";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Compare UK Mobile Phone Deals & SIM Only | ValueSwitch",
    template: "%s | ValueSwitch",
  },
  description: SHARE_DESC,
  keywords: [
    "mobile phone deals", "compare mobile deals", "Vodafone deals", "phone contracts UK",
    "SIM only deals", "cheap mobile deals", "Talkmobile", "Lebara deals", "UK mobile comparison",
    "VOXI deals", "voucher codes mobile", "broadband deals UK",
  ],
  authors: [{ name: "ValueSwitch" }],
  creator: "ValueSwitch",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: siteConfig.url,
    title: SHARE_TITLE,
    description: SHARE_DESC,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Compare UK mobile phone deals and SIM-only contracts — ValueSwitch",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [`${siteConfig.url}/opengraph-image`],
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

/** Each public page owns its canonical and share text; never inherit home. */
export function pageMetadata(path: string, title: string, description: string): Metadata {
  const url = new URL(path, siteConfig.url).toString();
  const cleanTitle = title.replace(/\s*\|\s*ValueSwitch$/, "");
  const shareTitle = `${cleanTitle} | ${siteConfig.name}`;
  return {
    title: cleanTitle,
    description,
    alternates: { canonical: url },
    openGraph: { ...defaultMetadata.openGraph, url, title: shareTitle, description },
    twitter: { ...defaultMetadata.twitter, title: shareTitle, description },
  };
}

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
