const providers = [
  "British Gas",
  "BT",
  "Sky",
  "Octopus Energy",
  "EE",
  "Virgin Media",
  "O2",
  "Vodafone",
  "EDF Energy",
  "Three",
  "Shell Energy",
  "TalkTalk",
];

export function ProviderLogos() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="mb-10 text-center">
        <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Trusted by leading UK providers
        </h2>
        <p className="text-sm text-muted-foreground">
          We compare deals from the UK&apos;s biggest and most trusted brands.
        </p>
      </div>

      <div className="relative">
        {/* Fade edges on mobile for scroll hint */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent sm:hidden" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent sm:hidden" />

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0">
          {providers.map((name) => (
            <div
              key={name}
              className="flex shrink-0 items-center rounded-full border border-border/60 bg-white px-5 py-2.5 text-sm font-medium text-muted-foreground grayscale transition-all hover:border-border hover:text-foreground hover:grayscale-0 dark:bg-slate-800/50"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
