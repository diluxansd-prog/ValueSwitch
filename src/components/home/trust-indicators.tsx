import { ShieldCheck, BadgePoundSterling, Zap } from "lucide-react";

const values = [
  {
    icon: ShieldCheck,
    title: "Real prices",
    description: "Every deal comes from our verified Awin affiliate partners. No fake prices or made-up savings.",
  },
  {
    icon: BadgePoundSterling,
    title: "Fair comparison",
    description: "We show you actual monthly costs with real contract details so you can make informed decisions.",
  },
  {
    icon: Zap,
    title: "Quick switching",
    description: "Click through to the provider directly. We earn a commission but it never affects your price.",
  },
];

export function TrustIndicators() {
  return (
    <section className="bg-slate-50 dark:bg-slate-900/50">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-18">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Why choose ValueSwitch?
          </h2>
          <p className="mt-2 text-muted-foreground text-sm">
            We only show real deals you can actually buy.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {values.map((item) => (
            <div key={item.title} className="flex flex-col items-center text-center rounded-2xl bg-white dark:bg-slate-800/50 p-8 shadow-sm">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-[#1a365d]/10 dark:bg-[#48bb78]/10 mb-4">
                <item.icon className="size-7 text-[#1a365d] dark:text-[#48bb78]" />
              </div>
              <h3 className="text-lg font-bold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
