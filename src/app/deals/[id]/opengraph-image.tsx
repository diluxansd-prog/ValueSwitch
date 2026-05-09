import { ImageResponse } from "next/og";
import { getDealBySlug } from "@/lib/services/deal.service";
import { getBrandColor } from "@/config/brand-colors";

/**
 * Per-deal OG image — generates a unique social-share preview for every
 * deal page.  Way better social CTR than the generic homepage card.
 *
 * Falls back gracefully if the deal can't be loaded (build-time DB
 * unavailability, deleted deal, etc.) — render a brand-coloured generic
 * card instead of crashing the build.
 */

export const runtime = "edge";
export const alt = "ValueSwitch — Real UK affiliate deals";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: { id: string };
}) {
  const deal = await getDealBySlug(params.id).catch(() => null);

  // Generic fallback if deal not loaded
  const providerName = deal?.provider.name ?? "Awin Verified";
  const dealName =
    deal?.name.replace(/ - £[\d.]+\/mo.*/, "") ?? "UK affiliate deal";
  const price = deal?.monthlyCost ?? null;
  const brand = deal ? getBrandColor(deal.provider.slug) : null;
  const heroFrom = brand?.from ?? "#1a365d";
  const heroTo = brand?.to ?? "#2a4a7f";
  const dataAllowance = deal?.dataAllowance ?? null;
  const contractLength = deal?.contractLength ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(135deg, ${heroFrom} 0%, ${heroTo} 60%, #0a1628 130%)`,
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

        {/* Top bar */}
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
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.85)",
              display: "flex",
            }}
          >
            ✓ Awin verified
          </span>
        </div>

        {/* Provider chip + headline */}
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
              fontSize: "20px",
              fontWeight: 700,
              color: "rgba(255,255,255,0.7)",
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginBottom: "12px",
              display: "flex",
            }}
          >
            {providerName}
          </span>
          <span
            style={{
              fontSize: "60px",
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-1.5px",
              maxWidth: "950px",
              display: "flex",
            }}
          >
            {dealName.length > 70
              ? dealName.slice(0, 67) + "…"
              : dealName}
          </span>
        </div>

        {/* Price + features row */}
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
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", gap: "10px" }}>
              {dataAllowance && (
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.95)",
                    padding: "8px 16px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    display: "flex",
                  }}
                >
                  {dataAllowance}
                </span>
              )}
              {contractLength && (
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.95)",
                    padding: "8px 16px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    display: "flex",
                  }}
                >
                  {contractLength} month
                </span>
              )}
            </div>
            <span
              style={{
                fontSize: "16px",
                color: "rgba(255,255,255,0.7)",
                display: "flex",
              }}
            >
              valueswitch.co.uk · live affiliate price
            </span>
          </div>

          {price !== null && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "4px",
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.7)",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  display: "flex",
                }}
              >
                From
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  background:
                    "linear-gradient(135deg, #38a169 0%, #48bb78 100%)",
                  padding: "16px 28px",
                  borderRadius: "16px",
                  boxShadow: "0 10px 30px rgba(56,161,105,0.5)",
                  gap: "4px",
                }}
              >
                <span
                  style={{
                    fontSize: "32px",
                    fontWeight: 800,
                    color: "white",
                  }}
                >
                  £
                </span>
                <span
                  style={{
                    fontSize: "76px",
                    fontWeight: 900,
                    color: "white",
                    letterSpacing: "-2px",
                  }}
                >
                  {price.toFixed(2)}
                </span>
                <span
                  style={{
                    fontSize: "26px",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.85)",
                    marginLeft: "6px",
                  }}
                >
                  /mo
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
