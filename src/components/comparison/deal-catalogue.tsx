"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ComparisonCard } from "@/components/comparison/comparison-card";
import { ListingUnavailable } from "@/components/shared/listing-unavailable";
import type { PlanWithProvider } from "@/types/comparison";

export function DealCatalogue({ plans, unavailable = false }: { plans: PlanWithProvider[]; unavailable?: boolean }) {
  const [query, setQuery] = useState("");
  const [budget, setBudget] = useState("");
  const [provider, setProvider] = useState("");
  const [sort, setSort] = useState("price");
  const providers = useMemo(() => [...new Map(plans.map(plan => [plan.provider.id, plan.provider])).values()], [plans]);
  const filtered = useMemo(() => plans.filter(plan => (!query || `${plan.name} ${plan.provider.name}`.toLowerCase().includes(query.toLowerCase())) && (!budget || plan.monthlyCost <= Number(budget)) && (!provider || plan.provider.id === provider)).sort((a, b) => sort === "upfront" ? a.setupFee - b.setupFee : sort === "total" ? (a.monthlyCost * (a.contractLength || 1) + a.setupFee) - (b.monthlyCost * (b.contractLength || 1) + b.setupFee) : a.monthlyCost - b.monthlyCost), [plans, query, budget, provider, sort]);
  const active = query || budget || provider;
  const fieldClass = "h-11 w-full min-w-0 rounded-xl border bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";
  if (unavailable) return <ListingUnavailable />;
  if (plans.length === 0) return <ListingUnavailable unavailable={false} title="No deals listed at the moment" description="We’re waiting for new listings in this category. Explore other offers or read a guide while you decide what matters most." />;
  return <div>
    <div className="mb-7 rounded-2xl border bg-card p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold"><SlidersHorizontal aria-hidden="true" className="size-4" />Make it your shortlist</div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div><label htmlFor="catalogue-query" className="mb-2 block text-xs font-medium text-muted-foreground">Phone or provider</label><div className="relative"><Search aria-hidden="true" className="absolute left-3 top-3.5 size-4 text-muted-foreground" /><input id="catalogue-query" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search these deals" className={`${fieldClass} pl-9`} /></div></div>
        <div><label htmlFor="catalogue-budget" className="mb-2 block text-xs font-medium text-muted-foreground">Monthly budget</label><select id="catalogue-budget" value={budget} onChange={e => setBudget(e.target.value)} className={fieldClass}><option value="">Any budget</option><option value="10">Up to £10</option><option value="20">Up to £20</option><option value="30">Up to £30</option><option value="50">Up to £50</option></select></div>
        <div><label htmlFor="catalogue-provider" className="mb-2 block text-xs font-medium text-muted-foreground">Provider</label><select id="catalogue-provider" value={provider} onChange={e => setProvider(e.target.value)} className={fieldClass}><option value="">All providers</option>{providers.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
        <div><label htmlFor="catalogue-sort" className="mb-2 block text-xs font-medium text-muted-foreground">Sort by</label><select id="catalogue-sort" value={sort} onChange={e => setSort(e.target.value)} className={fieldClass}><option value="price">Lowest monthly price</option><option value="upfront">Lowest upfront cost</option><option value="total">Lowest initial term cost</option></select></div>
      </div>
    </div>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><p aria-live="polite" className="text-sm text-muted-foreground"><strong className="text-foreground">{filtered.length}</strong> of {plans.length} listed deals</p>{active && <button onClick={() => { setQuery(""); setBudget(""); setProvider(""); }} className="flex items-center gap-1.5 text-sm font-medium text-emerald-800 dark:text-emerald-300"><X className="size-4" />Clear filters</button>}</div>
    {filtered.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map(plan => <ComparisonCard key={plan.id} plan={plan} />)}</div> : <div className="rounded-2xl border border-dashed bg-card p-10 text-center"><h3 className="text-lg font-semibold">No matches for these filters</h3><p className="mt-2 text-sm text-muted-foreground">Try a higher budget, another provider, or clear your filters above.</p></div>}
    <p className="mt-6 text-xs leading-5 text-muted-foreground">Prices may change during your contract. Initial term cost uses the listed monthly price, contract length and upfront cost; it excludes future price rises. Check the provider’s full terms before buying.</p>
  </div>;
}
