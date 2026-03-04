import { Users, PiggyBank, Star, ShieldCheck } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "2.7M+",
    label: "Switches",
    description: "Completed through our platform",
  },
  {
    icon: PiggyBank,
    value: "\u00a3312",
    label: "Avg Savings",
    description: "Saved per household each year",
  },
  {
    icon: Star,
    value: "4.7/5",
    label: "TrustPilot",
    description: "Based on 35,000+ reviews",
  },
  {
    icon: ShieldCheck,
    value: "Ofgem",
    label: "Accredited",
    description: "Fully regulated comparison",
  },
];

export function TrustIndicators() {
  return (
    <section className="bg-slate-50 dark:bg-slate-900/50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Trusted by millions of UK households
          </h2>
          <p className="text-muted-foreground">
            Join the millions who have already switched and saved with
            ValueSwitch.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-sm dark:bg-slate-800/50"
            >
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-[#1a365d]/10 dark:bg-[#38a169]/10">
                <stat.icon className="size-6 text-[#1a365d] dark:text-[#48bb78]" />
              </div>
              <p className="text-2xl font-bold text-foreground sm:text-3xl">
                {stat.value}
              </p>
              <p className="mb-1 text-sm font-semibold text-foreground">
                {stat.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
