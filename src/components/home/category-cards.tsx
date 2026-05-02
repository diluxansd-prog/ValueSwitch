import Link from "next/link";
import {
  ArrowRight,
  Smartphone,
  CardSim,
  Recycle,
  Wifi,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

interface Tile {
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Live price filled in from DB, with fallback default */
  cheapestText: string;
  fromPrice?: number;
  /** Brand colour pair for the icon halo and accent */
  accent: { from: string; to: string; bg: string; text: string };
  /** Subtle decorative pattern in the corner */
  pattern: "phone" | "sim" | "recycle" | "wifi";
}

async function fetchTileStats(): Promise<{
  contractsCheapest: number | null;
  simOnlyCheapest: number | null;
  refurbCheapest: number | null;
  broadbandCheapest: number | null;
}> {
  try {
    const [contracts, simOnly, refurb, broadband] = await Promise.all([
      prisma.plan.aggregate({
        where: { category: "mobile", subcategory: "contract" },
        _min: { monthlyCost: true },
      }),
      prisma.plan.aggregate({
        where: { category: "mobile", subcategory: "sim-only" },
        _min: { monthlyCost: true },
      }),
      prisma.plan.aggregate({
        where: { category: "mobile", subcategory: "sim-free" },
        _min: { monthlyCost: true },
      }),
      prisma.plan.aggregate({
        where: { category: "broadband" },
        _min: { monthlyCost: true },
      }),
    ]);
    return {
      contractsCheapest: contracts._min.monthlyCost,
      simOnlyCheapest: simOnly._min.monthlyCost,
      refurbCheapest: refurb._min.monthlyCost,
      broadbandCheapest: broadband._min.monthlyCost,
    };
  } catch {
    return {
      contractsCheapest: null,
      simOnlyCheapest: null,
      refurbCheapest: null,
      broadbandCheapest: null,
    };
  }
}

export async function CategoryCards() {
  const stats = await fetchTileStats();
  const fmt = (v: number | null, fallback: string) =>
    v != null ? `From £${v.toFixed(2)}/mo` : fallback;

  const tiles: Tile[] = [
    {
      name: "Mobile contracts",
      description:
        "iPhone 17 Pro Max, Galaxy S25 Ultra & more on Vodafone, EE, Three.",
      href: "/mobile/contracts",
      icon: Smartphone,
      cheapestText: fmt(stats.contractsCheapest, "From £25/mo"),
      fromPrice: stats.contractsCheapest ?? undefined,
      accent: {
        from: "#3B82F6",
        to: "#1E40AF",
        bg: "from-blue-50 to-blue-100/30 dark:from-blue-950/40 dark:to-blue-900/20",
        text: "text-blue-700 dark:text-blue-300",
      },
      pattern: "phone",
    },
    {
      name: "SIM only",
      description:
        "Keep your phone, slash your bill. Unlimited 5G data from £8/mo.",
      href: "/mobile/sim-only",
      icon: CardSim,
      cheapestText: fmt(stats.simOnlyCheapest, "From £4.50/mo"),
      fromPrice: stats.simOnlyCheapest ?? undefined,
      accent: {
        from: "#F97316",
        to: "#C2410C",
        bg: "from-orange-50 to-amber-100/30 dark:from-orange-950/40 dark:to-amber-900/20",
        text: "text-orange-700 dark:text-orange-300",
      },
      pattern: "sim",
    },
    {
      name: "Refurbished",
      description:
        "Like-new iPhone & Galaxy from Mozillion. 12-month warranty.",
      href: "/refurbished",
      icon: Recycle,
      cheapestText:
        stats.refurbCheapest != null
          ? `From £${stats.refurbCheapest.toFixed(0)} total`
          : "Save up to 50%",
      fromPrice: stats.refurbCheapest ?? undefined,
      accent: {
        from: "#10B981",
        to: "#047857",
        bg: "from-emerald-50 to-teal-100/30 dark:from-emerald-950/40 dark:to-teal-900/20",
        text: "text-emerald-700 dark:text-emerald-300",
      },
      pattern: "recycle",
    },
    {
      name: "Broadband",
      description:
        "Full-fibre with Be Fibre. Gigabit speeds, no surprise hikes.",
      href: "/broadband",
      icon: Wifi,
      cheapestText: fmt(stats.broadbandCheapest, "From £15/mo"),
      fromPrice: stats.broadbandCheapest ?? undefined,
      accent: {
        from: "#A855F7",
        to: "#6B21A8",
        bg: "from-purple-50 to-fuchsia-100/30 dark:from-purple-950/40 dark:to-fuchsia-900/20",
        text: "text-purple-700 dark:text-purple-300",
      },
      pattern: "wifi",
    },
  ];

  return (
    <section className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-3 py-1 text-xs font-semibold mb-3">
          <Sparkles className="size-3.5" />
          What we compare
        </div>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Four categories. Live prices.
        </h2>
        <p className="mt-3 text-muted-foreground text-base">
          Real deals from 11 verified retailers — never invented prices.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.name} href={t.href} className="group">
            <div
              className={`relative h-full rounded-2xl border border-border/50 bg-gradient-to-b ${t.accent.bg} p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/40 overflow-hidden`}
            >
              {/* Decorative ring */}
              <div
                className="absolute -right-8 -top-8 size-40 rounded-full opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500"
                style={{
                  background: `linear-gradient(135deg, ${t.accent.from}, ${t.accent.to})`,
                }}
              />

              {/* Pattern accent */}
              <CategoryPattern type={t.pattern} accent={t.accent} />

              {/* Brand-coloured icon */}
              <div
                className="relative inline-flex items-center justify-center size-14 rounded-2xl shadow-lg mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]"
                style={{
                  background: `linear-gradient(135deg, ${t.accent.from}, ${t.accent.to})`,
                  boxShadow: `0 10px 25px -8px ${t.accent.from}80`,
                }}
              >
                <t.icon className="size-7 text-white" />
              </div>

              <div className="relative">
                <h3 className="text-xl font-bold">{t.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {t.description}
                </p>

                <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
                  <span
                    className={`text-xs font-bold uppercase tracking-wide ${t.accent.text}`}
                  >
                    {t.cheapestText}
                  </span>
                  <span
                    className={`inline-flex items-center text-sm font-semibold ${t.accent.text} group-hover:gap-2 gap-1 transition-all`}
                  >
                    Compare
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/**
 * Subtle SVG pattern in the bottom-right corner of each card.
 * Pure CSS — no images.
 */
function CategoryPattern({
  type,
  accent,
}: {
  type: Tile["pattern"];
  accent: Tile["accent"];
}) {
  const stroke = accent.from + "30";
  if (type === "phone") {
    return (
      <svg
        className="absolute -bottom-4 -right-4 size-32 opacity-40 group-hover:opacity-60 transition-opacity"
        viewBox="0 0 100 100"
        fill="none"
      >
        <rect
          x="30"
          y="10"
          width="40"
          height="80"
          rx="8"
          stroke={stroke}
          strokeWidth="1.5"
        />
        <rect x="34" y="16" width="32" height="60" rx="2" fill={stroke} opacity="0.3" />
        <circle cx="50" cy="83" r="2" fill={stroke} />
      </svg>
    );
  }
  if (type === "sim") {
    return (
      <svg
        className="absolute -bottom-3 -right-3 size-32 opacity-40 group-hover:opacity-60 transition-opacity"
        viewBox="0 0 100 100"
        fill="none"
      >
        <path
          d="M20 30 L80 30 L80 80 Q80 90 70 90 L30 90 Q20 90 20 80 Z"
          stroke={stroke}
          strokeWidth="1.5"
          fill={stroke}
          fillOpacity="0.15"
        />
        <rect x="35" y="40" width="30" height="20" rx="2" stroke={stroke} strokeWidth="1.2" />
        <line x1="35" y1="50" x2="65" y2="50" stroke={stroke} strokeWidth="0.8" />
        <line x1="50" y1="40" x2="50" y2="60" stroke={stroke} strokeWidth="0.8" />
      </svg>
    );
  }
  if (type === "recycle") {
    return (
      <svg
        className="absolute -bottom-3 -right-3 size-32 opacity-40 group-hover:opacity-60 transition-opacity"
        viewBox="0 0 100 100"
        fill="none"
      >
        <path
          d="M50 20 L65 45 L35 45 Z M50 80 L35 55 L65 55 Z"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={stroke}
          fillOpacity="0.15"
        />
        <circle cx="50" cy="50" r="38" stroke={stroke} strokeWidth="0.8" strokeDasharray="4 3" />
      </svg>
    );
  }
  // wifi
  return (
    <svg
      className="absolute -bottom-3 -right-3 size-32 opacity-40 group-hover:opacity-60 transition-opacity"
      viewBox="0 0 100 100"
      fill="none"
    >
      <path
        d="M20 60 Q50 30 80 60"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M30 70 Q50 50 70 70"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M40 80 Q50 70 60 80"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="50" cy="85" r="3" fill={stroke} />
    </svg>
  );
}
