import { ArrowRight, SearchX, BookOpen } from "lucide-react";
import Link from "next/link";

export function ListingUnavailable({ title = "Deals are taking a moment", description = "We can’t load current prices right now. Please check back shortly. You can still explore our guides and compare your options.", unavailable = true }: { title?: string; description?: string; unavailable?: boolean }) {
  return <div className="relative overflow-hidden rounded-3xl border bg-card p-8 text-center sm:p-14" role="status">
    <div className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"><SearchX aria-hidden="true" className="size-7" /></div>
    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{unavailable ? "Prices temporarily unavailable" : "Your next match is out there"}</p>
    <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
    <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">{description}</p>
    <div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/guides" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"><BookOpen aria-hidden="true" className="size-4" />Explore guides</Link><Link href="/offers" className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-muted">Browse offers <ArrowRight aria-hidden="true" className="size-4" /></Link></div>
  </div>;
}
