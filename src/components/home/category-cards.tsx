import Link from "next/link";
import { ArrowRight, Smartphone, CardSim, Recycle, Wifi } from "lucide-react";
import { prisma } from "@/lib/prisma";

async function fetchPrices() {
  const available = { provider: { isActive: true }, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] };
  try {
    const prices = await Promise.all([
      prisma.plan.aggregate({ where: { ...available, category: "mobile", subcategory: "contract", monthlyCost: { gt: 0 } }, _min: { monthlyCost: true } }),
      prisma.plan.aggregate({ where: { ...available, category: "mobile", subcategory: "sim-only", monthlyCost: { gt: 0 } }, _min: { monthlyCost: true } }),
      prisma.plan.aggregate({ where: { ...available, category: "broadband", monthlyCost: { gt: 0 } }, _min: { monthlyCost: true } }),
    ]);
    return prices.map((price) => price._min.monthlyCost);
  } catch {
    return [null, null, null];
  }
}

export async function CategoryCards() {
  const [contracts, sim, broadband] = await fetchPrices();
  const priceLabel = (price: number | null) => price == null ? "Explore deals" : `From £${price.toFixed(2)}/mo`;
  const categories = [
    { name: "Mobile contracts", description: "A new phone and a plan that works for you.", href: "/mobile/contracts", icon: Smartphone, detail: priceLabel(contracts), color: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
    { name: "SIM only", description: "Keep your handset. Give your monthly bill a rethink.", href: "/mobile/sim-only", icon: CardSim, detail: priceLabel(sim), color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
    { name: "Refurbished phones", description: "A second life for a phone. A fresh option for you.", href: "/refurbished", icon: Recycle, detail: "Explore phones", color: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300" },
    { name: "Broadband", description: "Find a connection that keeps up with your home.", href: "/broadband", icon: Wifi, detail: priceLabel(broadband), color: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300" },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Your next move</p><h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">What would you like to compare?</h2></div>
        <p className="max-w-xs text-sm leading-6 text-muted-foreground">From a better mobile plan to your next home connection.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <Link key={category.href} href={category.href} className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-emerald-600/50 hover:bg-muted/30">
            <div className={`mb-6 flex size-12 items-center justify-center rounded-xl ${category.color}`}><category.icon aria-hidden="true" className="size-6" /></div>
            <h3 className="text-lg font-semibold tracking-tight">{category.name}</h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{category.description}</p>
            <div className="mt-6 flex items-center justify-between border-t pt-4 text-sm font-semibold"><span>{category.detail}</span><ArrowRight aria-hidden="true" className="size-4 text-emerald-700 transition-transform group-hover:translate-x-1 dark:text-emerald-400" /></div>
          </Link>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-muted-foreground">Monthly starting prices exclude any upfront costs. Check the full deal and provider terms before buying.</p>
    </section>
  );
}
