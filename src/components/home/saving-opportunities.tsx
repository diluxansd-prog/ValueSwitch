import Link from "next/link";
import { ArrowUpRight, CardSim, Recycle, BookOpen } from "lucide-react";

const opportunities = [
  { icon: CardSim, eyebrow: "Keep your phone", title: "New plan. Same favourite phone.", description: "Happy with your handset? Explore SIM-only plans under £10 a month.", href: "/sim-only/under-10", action: "Explore SIM-only deals" },
  { icon: Recycle, eyebrow: "Rethink your upgrade", title: "A second life. A fresh start.", description: "Explore refurbished phones and check each seller’s condition grades and warranty.", href: "/refurbished", action: "Browse refurbished phones" },
  { icon: BookOpen, eyebrow: "Switch with confidence", title: "A little know-how goes a long way.", description: "Get practical help with networks, contracts and choosing your next deal.", href: "/guides", action: "Read our guides" },
];

export function SavingOpportunities() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Small changes, worth exploring</p>
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Find your next saving opportunity.</h2>
      <p className="mt-3 max-w-xl text-muted-foreground">Not sure where to start? These are three useful places to look.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {opportunities.map((item) => (
          <Link key={item.href} href={item.href} className="group flex flex-col rounded-2xl border bg-card p-6 transition-colors hover:border-emerald-600/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20">
            <div className="mb-8 flex items-center justify-between"><item.icon aria-hidden="true" className="size-7 text-emerald-700 dark:text-emerald-400" /><ArrowUpRight aria-hidden="true" className="size-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div>
            <p className="text-xs font-medium text-muted-foreground">{item.eyebrow}</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight">{item.title}</h3>
            <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
            <span className="mt-6 text-sm font-semibold text-emerald-800 dark:text-emerald-300">{item.action}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
