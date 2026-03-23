const providers = [
  { name: "Vodafone", live: true },
  { name: "Talkmobile", live: true },
  { name: "TTfone", live: true },
  { name: "Lebara", live: true },
];

export function ProviderLogos() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="mb-10 text-center">
        <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Our Affiliate Partners
        </h2>
        <p className="text-sm text-muted-foreground">
          We work directly with these providers through the Awin affiliate network.
        </p>
      </div>

      <div className="flex gap-3 flex-wrap justify-center">
        {providers.map((provider) => (
          <div
            key={provider.name}
            className="flex items-center gap-2 rounded-full border border-border/60 bg-white px-5 py-2.5 text-sm font-medium text-foreground dark:bg-slate-800/50"
          >
            <span>{provider.name}</span>
            {provider.live && (
              <span className="flex size-2 rounded-full bg-green-500" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
