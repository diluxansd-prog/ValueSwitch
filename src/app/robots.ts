import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    // One consistent rule applies to search and AI crawlers alike. Public
    // utility pages remain crawlable so their noindex metadata can be read.
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard", "/admin"] },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
