import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-hosted on a VPS: emit a standalone server bundle (server.js plus
  // only the node_modules it actually needs) so deploys are an rsync and
  // a systemd restart rather than a full npm install on the box.
  output: "standalone",
  outputFileTracingIncludes: {
    "/guides/**/*": ["./content/guides/**/*.md"],
    "/guides": ["./content/guides/**/*.md"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.bigupdata.co.uk",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "images2.productserve.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
