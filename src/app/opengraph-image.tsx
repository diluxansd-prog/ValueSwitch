import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Compare UK mobile phone deals and SIM-only contracts from £9.50/mo — ValueSwitch";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * OpenGraph share card.
 *
 * Design goals:
 *   - Strong hierarchy — the headline + price anchor are readable at
 *     Twitter's 350px display width, not just native 1200px.
 *   - Clear CTA button bottom-right — fixes the "missing CTA" flag
 *     that opengraph.xyz raises.
 *   - Concrete price + saving figure — social previews need a hook,
 *     not a tagline.  "£9.50/mo" and "Save £300+" do the selling.
 *   - Trust row of partner brands — instant credibility.
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #0f2847 0%, #1a365d 45%, #2a4a7f 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          padding: "64px",
          color: "white",
          overflow: "hidden",
        }}
      >
        {/* Decorative glow — top right */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            right: "-150px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(56,161,105,0.35) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        {/* Decorative glow — bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: "-200px",
            left: "-200px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(72,187,120,0.22) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Logo row */}
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
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #38a169 0%, #48bb78 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
              boxShadow: "0 4px 12px rgba(56,161,105,0.5)",
            }}
          >
            ⚡
          </div>
          <span
            style={{
              fontSize: "36px",
              fontWeight: 800,
              letterSpacing: "-0.5px",
            }}
          >
            ValueSwitch
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: "16px",
              padding: "8px 16px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.8)",
              display: "flex",
            }}
          >
            ⭐ 4.7 · Awin Verified
          </span>
        </div>

        {/* Main headline block */}
        <div
          style={{
            marginTop: "50px",
            display: "flex",
            flexDirection: "column",
            zIndex: 10,
          }}
        >
          <span
            style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "#48bb78",
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginBottom: "12px",
              display: "flex",
            }}
          >
            UK Mobile Phone Comparison
          </span>
          <span
            style={{
              fontSize: "72px",
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-2px",
              maxWidth: "850px",
              display: "flex",
            }}
          >
            SIM-only deals
          </span>
          <span
            style={{
              fontSize: "72px",
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-2px",
              display: "flex",
            }}
          >
            from{" "}
            <span
              style={{
                marginLeft: "16px",
                background:
                  "linear-gradient(135deg, #48bb78 0%, #9ae6b4 100%)",
                backgroundClip: "text",
                color: "transparent",
                display: "flex",
              }}
            >
              £9.50/mo
            </span>
          </span>
          <span
            style={{
              fontSize: "26px",
              marginTop: "18px",
              color: "rgba(255,255,255,0.78)",
              display: "flex",
            }}
          >
            Save £300+/year on your mobile phone contract
          </span>
        </div>

        {/* Bottom row: partner brands + CTA */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
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
                color: "rgba(255,255,255,0.5)",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                display: "flex",
              }}
            >
              Trusted Partners
            </span>
            <div style={{ display: "flex", gap: "20px" }}>
              {["Vodafone", "Talkmobile", "Lebara", "TTfone"].map((p) => (
                <span
                  key={p}
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.85)",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    display: "flex",
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* CTA pill — opengraph.xyz flagged this as missing before */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "22px 36px",
              borderRadius: "999px",
              background:
                "linear-gradient(135deg, #38a169 0%, #48bb78 100%)",
              boxShadow:
                "0 10px 30px rgba(56,161,105,0.5), 0 0 0 1px rgba(255,255,255,0.2) inset",
            }}
          >
            <span
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "white",
              }}
            >
              Compare Deals
            </span>
            <span style={{ fontSize: "24px", color: "white" }}>→</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
