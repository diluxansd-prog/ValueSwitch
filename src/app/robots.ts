import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Main search engines + default
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/admin/"],
      },
      // AI search crawlers — explicitly allow, they're the 2026 traffic source
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "Claude-Web", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Perplexity-User", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "Applebot", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
      { userAgent: "Meta-ExternalAgent", allow: "/" },
      { userAgent: "Bytespider", allow: "/" },
      { userAgent: "DuckAssistBot", allow: "/" },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
