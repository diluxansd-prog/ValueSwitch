import { ImageResponse } from "next/og";
import { getGuideBySlug } from "@/lib/services/guide.service";

/**
 * Per-guide OG image — gives each pillar article its own social card
 * with title, author and read-time.  Major social-CTR boost vs the
 * generic homepage card.
 */

// Node runtime instead of edge — `getGuideBySlug` pulls in the Prisma
// client, which exceeds Vercel's 1 MB Edge Function size limit on
// Hobby/Pro plans. Node functions have a 50 MB limit so we stay well
// within budget while keeping the dynamic per-guide OG image.
export const runtime = "nodejs";
export const alt = "ValueSwitch Guide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CATEGORY_GRADIENTS: Record<string, [string, string]> = {
  mobile: ["#1e40af", "#1e3a8a"],
  broadband: ["#7c3aed", "#5b21b6"],
  energy: ["#ea580c", "#c2410c"],
  insurance: ["#0d9488", "#0f766e"],
  finance: ["#dc2626", "#991b1b"],
};

export default async function Image({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const guide = await getGuideBySlug(params.slug).catch(() => null);

  const title = guide?.title ?? "ValueSwitch Guide";
  const author = guide?.author ?? "ValueSwitch Editors";
  const readTime = guide?.readTime ?? null;
  const category = (guide?.category ?? params.category).toLowerCase();
  const [from, to] = CATEGORY_GRADIENTS[category] ?? ["#1a365d", "#2a4a7f"];

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          padding: "64px",
          color: "white",
          overflow: "hidden",
        }}
      >
        {/* Glow halos */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            right: "-150px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-200px",
            left: "-200px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Top: brand + category */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #38a169 0%, #48bb78 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              boxShadow: "0 4px 12px rgba(56,161,105,0.5)",
            }}
          >
            ⚡
          </div>
          <span
            style={{
              fontSize: "30px",
              fontWeight: 800,
              letterSpacing: "-0.5px",
            }}
          >
            ValueSwitch
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: "15px",
              padding: "8px 16px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.1)",
              color: "white",
              fontWeight: 700,
              textTransform: "capitalize",
              display: "flex",
            }}
          >
            {category} guide
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            marginTop: "56px",
            display: "flex",
            flexDirection: "column",
            zIndex: 10,
          }}
        >
          <span
            style={{
              fontSize: title.length > 80 ? 52 : 64,
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              maxWidth: "1000px",
              display: "flex",
            }}
          >
            {title.length > 130 ? title.slice(0, 127) + "…" : title}
          </span>
        </div>

        {/* Footer: author + read time + URL */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.6)",
                textTransform: "uppercase",
                letterSpacing: "2px",
                display: "flex",
              }}
            >
              Written by
            </span>
            <span
              style={{
                fontSize: "26px",
                fontWeight: 800,
                color: "white",
                display: "flex",
              }}
            >
              {author}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "8px",
            }}
          >
            {readTime && (
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  padding: "8px 18px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                  display: "flex",
                }}
              >
                {readTime} min read
              </span>
            )}
            <span
              style={{
                fontSize: "16px",
                color: "rgba(255,255,255,0.7)",
                display: "flex",
              }}
            >
              valueswitch.co.uk
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
