import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ProviderLogo } from "@/components/shared/provider-logo";
import { getPopularDeals } from "@/lib/services/deal.service";

export async function PopularDeals() {
  const deals = await getPopularDeals("mobile", 6);
  if (deals.length === 0) return null;

  return (
    <section className="border-y border-border/60 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Explore our shortlist</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Featured mobile deals</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">A selection from our affiliate partners. Promoted deals appear first; compare the full costs and terms to find your fit.</p>
          </div>
          <Link href="/mobile/compare" className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-muted">View all deals <ArrowRight aria-hidden="true" className="size-4" /></Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {deals.map((deal) => {
            const outright = deal.subcategory === "sim-free";
            return (
              <article key={deal.id} className="flex flex-col rounded-2xl border bg-card p-5 sm:p-6">
                <div className="flex items-center gap-4">
                  {deal.imageUrl ? (
                    <div className="relative size-16 shrink-0 rounded-xl bg-white">
                      <Image src={deal.imageUrl} alt={deal.name} fill sizes="64px" className="object-contain p-2" />
                    </div>
                  ) : <ProviderLogo name={deal.provider.name} slug={deal.provider.slug} logo={deal.provider.logo} size={50} />}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><span>{deal.provider.name}</span>{deal.isPromoted && <span className="rounded bg-muted px-2 py-0.5">Promoted</span>}</div>
                    <h3 className="mt-1 text-base font-semibold leading-6">{deal.name.replace(/ - £[\d.]+\/mo.*/, "")}</h3>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {deal.dataAllowance && <span className="rounded-md bg-muted px-2.5 py-1.5">{deal.dataAllowance} data</span>}
                  {deal.networkType && <span className="rounded-md bg-muted px-2.5 py-1.5">{deal.networkType}</span>}
                  {!outright && deal.contractLength != null && <span className="rounded-md bg-muted px-2.5 py-1.5">{deal.contractLength > 0 ? `${deal.contractLength}-month contract` : "No fixed term"}</span>}
                </div>
                <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-6">
                  <div>
                    <p><span className="text-2xl font-semibold tracking-tight tabular-nums">£{deal.monthlyCost.toFixed(2)}</span><span className="ml-1 text-xs text-muted-foreground">{outright ? "one-off" : "/month"}</span></p>
                    {!outright && <p className="mt-1 text-xs text-muted-foreground">{deal.setupFee > 0 ? `£${deal.setupFee.toFixed(2)} upfront` : "No upfront cost"}</p>}
                  </div>
                  <Link href={`/deals/${deal.slug}`} aria-label={`View ${deal.name} from ${deal.provider.name}`} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">View deal <ArrowRight aria-hidden="true" className="size-4" /></Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
