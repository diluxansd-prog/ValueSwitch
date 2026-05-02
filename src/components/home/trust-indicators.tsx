import {
  ShieldCheck,
  BadgePoundSterling,
  Zap,
  RefreshCw,
  Award,
  Lock,
} from "lucide-react";

const values = [
  {
    icon: ShieldCheck,
    title: "Real prices, never invented",
    description:
      "Every deal pulled live from our verified Awin partner feeds. No padding, no fake savings, no expired offers.",
    color: "from-emerald-500 to-teal-600",
    badge: "Awin verified",
  },
  {
    icon: RefreshCw,
    title: "Updated weekly",
    description:
      "Vercel cron pulls fresh feeds every Sunday at 03:00 UTC. Price drops show up automatically — no stale listings.",
    color: "from-blue-500 to-indigo-600",
    badge: "Auto-refresh",
  },
  {
    icon: BadgePoundSterling,
    title: "Honest commission disclosure",
    description:
      "We earn affiliate commission when you buy. It never changes the price you pay or which deals we rank highest.",
    color: "from-amber-500 to-orange-600",
    badge: "FCA-friendly",
  },
  {
    icon: Lock,
    title: "Your data, your business",
    description:
      "We don't sell email addresses, don't share your search history, don't run third-party trackers beyond essential.",
    color: "from-purple-500 to-fuchsia-600",
    badge: "GDPR compliant",
  },
  {
    icon: Award,
    title: "Registered UK company",
    description:
      "VALUESWITCH LIMITED, Companies House #17108611, Coventry. Real address, real accountability.",
    color: "from-rose-500 to-pink-600",
    badge: "Companies House",
  },
  {
    icon: Zap,
    title: "Instant comparison",
    description:
      "Filter by price, network, contract length. Click through to the merchant in one tap. No multi-step quote forms.",
    color: "from-cyan-500 to-sky-600",
    badge: "One-click",
  },
];

export function TrustIndicators() {
  return (
    <section className="relative bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900/50 dark:via-slate-950 dark:to-slate-900/50 overflow-hidden">
      {/* Decorative side glows */}
      <div className="absolute top-1/2 -translate-y-1/2 -left-32 w-72 h-72 rounded-full bg-emerald-200/30 dark:bg-emerald-900/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -translate-y-1/2 -right-32 w-72 h-72 rounded-full bg-blue-200/30 dark:bg-blue-900/20 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1 text-xs font-semibold mb-3">
            <ShieldCheck className="size-3.5" />
            Why ValueSwitch
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Built honest. Built UK-first.
          </h2>
          <p className="mt-3 text-muted-foreground text-base max-w-2xl mx-auto">
            We're a small registered UK company, not a venture-funded
            comparison site. Six things we do differently.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((item) => (
            <div
              key={item.title}
              className="group relative rounded-2xl bg-white dark:bg-slate-800/50 border border-border/50 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} shadow-md group-hover:scale-110 group-hover:rotate-[-6deg] transition-transform`}
                >
                  <item.icon className="size-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-base font-bold">{item.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                    ✓ {item.badge}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
