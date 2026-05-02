/**
 * Real brand colours per merchant — pulled from each company's published
 * brand guidelines or their primary website CSS. Used by ProviderLogo to
 * render a distinctive avatar even when we don't have a hosted logo file.
 *
 * Resist the urge to use generic "blue" for every brand — brand recognition
 * on the cards comes from these specific colours.
 */

export interface BrandColor {
  /** Tailwind-compatible CSS gradient — used in `bg-gradient-to-br ${gradient}` form */
  from: string;
  to: string;
  /** Optional override for the initials (defaults to extracted initials) */
  abbr?: string;
  /** Text colour (defaults white; use #000 for light brand colours) */
  text?: string;
}

export const BRAND_COLORS: Record<string, BrandColor> = {
  vodafone: { from: "#E60000", to: "#990000", abbr: "VF" },
  lebara: { from: "#00A0E3", to: "#005EB8" },
  talkmobile: { from: "#7B2CBF", to: "#5A189A", abbr: "TM" },
  fonehouse: { from: "#FF6B00", to: "#CC4F00", abbr: "FH" },
  mozillion: { from: "#00C896", to: "#008F6A", abbr: "MZ" },
  "grade-mobile": { from: "#10B981", to: "#047857", abbr: "GM" },
  "be-fibre": { from: "#0EA5E9", to: "#0369A1", abbr: "BF" },
  "1pmobile": { from: "#FF7A00", to: "#CC5A00", abbr: "1p" },
  ecotalk: { from: "#22C55E", to: "#15803D", abbr: "EC" },
  ttfone: { from: "#6B7280", to: "#374151", abbr: "TT" },
  "sim-local": { from: "#06B6D4", to: "#0E7490", abbr: "SL" },
  yourcoop: { from: "#0033A0", to: "#001F66", abbr: "Co" },
  "tirendo-uk": { from: "#000000", to: "#1F1F1F", abbr: "TR" },
};

export function getBrandColor(slug: string): BrandColor | null {
  return BRAND_COLORS[slug] || null;
}
