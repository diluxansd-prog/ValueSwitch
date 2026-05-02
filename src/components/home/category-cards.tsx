import Link from "next/link";
import { ArrowRight, Smartphone, CardSim, Recycle, Wifi } from "lucide-react";

interface Tile {
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight: string;
  gradient: string;
  iconRing: string;
}

const tiles: Tile[] = [
  {
    name: "Mobile contracts",
    description: "iPhone 17 Pro Max, Galaxy S25 Ultra & more on Vodafone, EE, Three.",
    href: "/mobile/contracts",
    icon: Smartphone,
    highlight: "From £25/mo",
    gradient: "from-blue-500/10 to-blue-50",
    iconRing: "bg-blue-50 text-blue-600 ring-blue-100",
  },
  {
    name: "SIM only",
    description: "Keep your phone, slash your bill. Unlimited 5G data from £8/mo.",
    href: "/mobile/sim-only",
    icon: CardSim,
    highlight: "From £4.50/mo",
    gradient: "from-orange-500/10 to-orange-50",
    iconRing: "bg-orange-50 text-orange-600 ring-orange-100",
  },
  {
    name: "Refurbished",
    description: "Like-new iPhone & Galaxy from Mozillion. 12-month warranty.",
    href: "/refurbished",
    icon: Recycle,
    highlight: "Save up to 50%",
    gradient: "from-emerald-500/10 to-emerald-50",
    iconRing: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  },
  {
    name: "Broadband",
    description: "Full-fibre with Be Fibre. Gigabit speeds, no surprise hikes.",
    href: "/broadband",
    icon: Wifi,
    highlight: "From £29/mo",
    gradient: "from-purple-500/10 to-purple-50",
    iconRing: "bg-purple-50 text-purple-600 ring-purple-100",
  },
];

export function CategoryCards() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          What are you comparing today?
        </h2>
        <p className="mt-2 text-muted-foreground">
          Four categories. Live prices. One place to find them.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.name} href={t.href} className="group">
            <div
              className={`relative h-full rounded-2xl border border-border/60 bg-gradient-to-b ${t.gradient} dark:from-slate-800/40 dark:to-slate-900/40 p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl overflow-hidden`}
            >
              <div className="absolute -right-8 -top-8 size-32 rounded-full bg-white/40 dark:bg-white/5 group-hover:scale-110 transition-transform duration-500" />

              <div
                className={`relative inline-flex items-center justify-center size-12 rounded-xl ring-1 ring-inset ${t.iconRing} dark:bg-white/5 dark:ring-white/10 dark:text-white mb-4`}
              >
                <t.icon className="size-6" />
              </div>

              <div className="relative">
                <h3 className="text-lg font-bold">{t.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {t.description}
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                    {t.highlight}
                  </span>
                  <span className="inline-flex items-center text-sm font-semibold text-[#1a365d] dark:text-emerald-300 group-hover:gap-2 gap-1 transition-all">
                    Compare
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
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
