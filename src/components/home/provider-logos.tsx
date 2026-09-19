import Link from "next/link";

const providers = [
  { name: "Vodafone", slug: "vodafone" },
  { name: "Talkmobile", slug: "talkmobile" },
  { name: "Lebara", slug: "lebara" },
];

export function ProviderLogos() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="mb-10 text-center">
        <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Our Partners
        </h2>
        <p className="text-sm text-muted-foreground">
          Real deals from verified providers through the Awin affiliate network.
        </p>
      </div>

      <div className="flex gap-4 flex-wrap justify-center">
        {providers.map((provider) => (
          <Link
            key={provider.name}
            href={`/providers/${provider.slug}`}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-white px-6 py-4 transition-colors hover:border-emerald-600 dark:bg-slate-800/50"
          >
            <div className="flex size-3 rounded-full bg-green-500 shrink-0" />
            <div>
              <span className="text-sm font-semibold">{provider.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
