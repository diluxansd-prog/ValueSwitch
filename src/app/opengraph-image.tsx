import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ValueSwitch - Compare & Save on Energy, Broadband, Mobile & More";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a365d 0%, #2a4a7f 50%, #38a169 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
            }}
          >
            ⚡
          </div>
          <span
            style={{
              fontSize: "48px",
              fontWeight: 800,
              color: "white",
            }}
          >
            ValueSwitch
          </span>
        </div>
        <div
          style={{
            fontSize: "28px",
            color: "rgba(255,255,255,0.9)",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.4,
          }}
        >
          Compare & Save on Energy, Broadband, Mobile & More
        </div>
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "40px",
            fontSize: "18px",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          <span>🔌 Energy</span>
          <span>📡 Broadband</span>
          <span>📱 Mobile</span>
          <span>🛡️ Insurance</span>
          <span>💰 Finance</span>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            fontSize: "16px",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          valueswitch.co.uk • Free UK Price Comparison
        </div>
      </div>
    ),
    { ...size }
  );
}
