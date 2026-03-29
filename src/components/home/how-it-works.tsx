import { Search, BarChart3, ExternalLink } from "lucide-react";

const steps = [
  { number: 1, icon: Search, title: "Browse deals", description: "Filter by price, data, provider and contract length to find deals that suit you." },
  { number: 2, icon: BarChart3, title: "Compare", description: "Add deals to your basket and compare them side by side with full details." },
  { number: 3, icon: ExternalLink, title: "Switch", description: "Click through to the provider via our affiliate link and complete your switch." },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-18">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          How it works
        </h2>
        <p className="mt-2 text-muted-foreground text-sm">Compare, choose, and save in three steps.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center text-center">
            <div className="relative mb-5">
              <div className="flex size-16 items-center justify-center rounded-full bg-[#1a365d] shadow-lg">
                <step.icon className="size-7 text-white" />
              </div>
              <div className="absolute -right-1 -top-1 flex size-7 items-center justify-center rounded-full bg-[#48bb78] text-xs font-bold text-white">
                {step.number}
              </div>
            </div>
            <h3 className="text-lg font-bold">{step.title}</h3>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
