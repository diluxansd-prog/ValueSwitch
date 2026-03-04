import { Search, BarChart3, ArrowRightLeft } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: Search,
    title: "Tell us what you need",
    description:
      "Enter your postcode and current usage details so we can find the best deals for your area.",
  },
  {
    number: 2,
    icon: BarChart3,
    title: "Compare deals",
    description:
      "We\u2019ll search hundreds of deals from trusted UK providers to find the best matches for you.",
  },
  {
    number: 3,
    icon: ArrowRightLeft,
    title: "Switch & save",
    description:
      "Switch online in minutes. We handle the hard work so you can start saving straight away.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="mb-12 text-center">
        <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          How ValueSwitch Works
        </h2>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Switching is simple. Compare, choose, and save in three easy steps.
        </p>
      </div>

      <div className="relative grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
        {/* Connecting line (desktop only) */}
        <div className="absolute left-0 right-0 top-[3.25rem] z-0 hidden md:block">
          <div className="mx-auto h-0.5 w-[calc(100%-12rem)] bg-gradient-to-r from-[#1a365d]/20 via-[#38a169]/30 to-[#1a365d]/20" />
        </div>

        {steps.map((step) => (
          <div
            key={step.number}
            className="relative z-10 flex flex-col items-center text-center"
          >
            {/* Numbered circle */}
            <div className="relative mb-6">
              <div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-[#1a365d] to-[#2a4a7f] shadow-lg shadow-[#1a365d]/20">
                <step.icon className="size-8 text-white" />
              </div>
              <div className="absolute -right-1 -top-1 flex size-7 items-center justify-center rounded-full bg-[#38a169] text-xs font-bold text-white shadow-sm">
                {step.number}
              </div>
            </div>

            {/* Content */}
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              {step.title}
            </h3>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
