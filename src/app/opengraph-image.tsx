import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ValueSwitch — compare UK mobile, SIM-only and broadband deals";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Evergreen share artwork: no static prices or unsupported savings claims.
export default function Image() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "60px 70px", color: "#fff", background: "linear-gradient(125deg,#0c2528,#244238)", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 34, fontWeight: 700 }}>ValueSwitch</span>
        <span style={{ fontSize: 18, color: "#d9ef96", border: "1px solid #ffffff40", borderRadius: 30, padding: "12px 22px" }}>Free to compare</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 62, fontWeight: 700, fontSize: 88, letterSpacing: -4, lineHeight: 1.05 }}>
        <span>Less on bills.</span><span style={{ color: "#d9ef96" }}>More for you.</span>
      </div>
      <p style={{ fontSize: 27, color: "#cfdbd7", marginTop: 28 }}>Phone contracts. SIM only. Broadband.</p>
      <div style={{ display: "flex", marginTop: "auto", borderTop: "1px solid #ffffff30", paddingTop: 24, justifyContent: "space-between", fontSize: 20 }}><span>Find the deal that fits your life.</span><span style={{ color: "#d9ef96" }}>valueswitch.co.uk →</span></div>
    </div>, size,
  );
}
