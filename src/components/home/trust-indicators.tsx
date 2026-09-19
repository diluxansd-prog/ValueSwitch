import Link from "next/link";
import { ArrowRight, BadgePoundSterling, ListChecks, ExternalLink } from "lucide-react";

const values = [
  { icon: BadgePoundSterling, title: "Free to explore", description: "Browse and compare without creating an account or paying a comparison fee." },
  { icon: ListChecks, title: "The details that matter", description: "Look beyond the monthly price. Compare upfront costs, allowances and contract lengths." },
  { icon: ExternalLink, title: "You stay in control", description: "Choose a deal, then confirm the latest price and terms directly with the provider." },
];

export function TrustIndicators() {
  return (
    <section className="border-y border-border/60 bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div><p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Comparison, made clearer</p><h2 className="text-3xl font-semibold tracking-tight">Good decisions start with the details.</h2></div>
          <Link href="/how-it-works" className="inline-flex items-center gap-2 text-sm font-semibold hover:underline underline-offset-4">How we work <ArrowRight aria-hidden="true" className="size-4" /></Link>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {values.map((item) => <div key={item.title}><item.icon aria-hidden="true" className="mb-4 size-6 text-emerald-700 dark:text-emerald-400" /><h3 className="font-semibold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p></div>)}
        </div>
      </div>
    </section>
  );
}
