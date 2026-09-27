import { ArrowRight, SearchX, BookOpen, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { FallbackOffer } from "@/lib/offers-live";

export function ListingUnavailable({ title = "Deals are taking a moment", description = "We can’t load current prices right now. Please check back shortly. You can still explore our guides and compare your options.", unavailable = true, offers = [] }: { title?: string; description?: string; unavailable?: boolean; offers?: FallbackOffer[] }) {
  return <div className="relative overflow-hidden rounded-3xl border bg-card p-8 text-center sm:p-14" role="status">
    <div className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"><SearchX aria-hidden="true" className="size-7" /></div>
    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{unavailable ? "Prices temporarily unavailable" : "Your next match is out there"}</p>
    <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
    <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">{description}</p>
    <div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/guides" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"><BookOpen aria-hidden="true" className="size-4" />Explore guides</Link><Link href="/offers" className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-muted">Browse offers <ArrowRight aria-hidden="true" className="size-4" /></Link></div>
    {offers.length > 0 && <div className="mt-10 border-t pt-8 text-left">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">Straight from our partners</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {offers.map(offer => <a key={offer.id} href={offer.href} target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-2xl border bg-background p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg">
          <div className="flex items-center justify-between gap-2"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{offer.merchantName}</p><span className="rounded-md bg-gradient-to-r from-[#1a365d] to-[#38a169] px-2 py-0.5 text-[10px] font-extrabold text-white">{offer.badge}</span></div>
          <h3 className="mt-2 text-sm font-bold leading-snug">{offer.title}</h3>
          <p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">{offer.description}</p>
          <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">View at {offer.merchantName}<ArrowUpRight aria-hidden="true" className="size-3.5" /><span className="sr-only"> (opens in a new tab)</span></span>
        </a>)}
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">Affiliate links · We may earn a commission at no cost to you. Confirm the price and terms with the retailer.</p>
    </div>}
  </div>;
}
