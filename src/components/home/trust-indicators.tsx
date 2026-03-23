import { Users, PiggyBank, Star, ShieldCheck } from "lucide-react";

const stats = [
  {
    icon: ShieldCheck,
    value: "Awin",
    label: "Verified",
    description: "Official affiliate partner",
  },
  {
    icon: PiggyBank,
    value: "66+",
    label: "Real Deals",
    description: "From verified providers",
  },
  {
    icon: Star,
    value: "4",
    label: "Partners",
    description: "Vodafone, Talkmobile & more",
  },
  {
    icon: Users,
    value: "100%",
    label: "Real Data",
    description: "No fake or mock deals",
  },
];

export function TrustIndicators() {
  return (
    <section className="bg-slate-50 dark:bg-slate-900/50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why ValueSwitch?
          </h2>
          <p className="text-muted-foreground">
            We only show real deals from verified affiliate partners. No fake data, no inflated savings.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center rounded-xl bg-white p-4 sm:p-6 text-center shadow-sm dark:bg-slate-800/50"
            >
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-[#1a365d]/10 dark:bg-[#38a169]/10">
                <stat.icon className="size-6 text-[#1a365d] dark:text-[#48bb78]" />
              </div>
              <p className="text-xl font-bold text-foreground sm:text-2xl lg:text-3xl">
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
