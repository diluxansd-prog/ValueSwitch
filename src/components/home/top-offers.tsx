import Link from "next/link";
import { ArrowRight, BadgePercent, Clock } from "lucide-react";
import { getBrandColor } from "@/config/brand-colors";
import { getActiveOffers, getOfferLink } from "@/lib/offers";
import { OfferCode } from "@/components/shared/offer-code";

/**
 * Homepage strip of the top live voucher codes — static data from
 * src/lib/offers.ts, so it costs no DB queries and always renders.
 * Links through to /offers for the full list.
 */
export function TopOffers() {
  // Highest-priority offer per merchant, codes first — keeps the strip varied.
  const seen = new Set<string>();
  const offers = getActiveOffers()
    .sort((a, b) => Number(!!b.code) - Number(!!a.code) || b.priority - a.priority)
    .filter((o) => !seen.has(o.merchant) && (seen.add(o.merchant), true))
    .slice(0, 4);

  if (offers.length === 0) return null;

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/40 dark:to-slate-950 border-y border-border/40">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2">
              <BadgePercent className="size-4" />
              Live from our partners
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold">
              Voucher codes &amp; offers
            </h2>
          </div>
          <Link
            href="/offers"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a365d] dark:text-emerald-400 hover:underline underline-offset-4 shrink-0"
          >
            See all offers
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {offers.map((offer) => {
            const brand = getBrandColor(offer.merchant);
            const grad = brand
              ? `linear-gradient(135deg, ${brand.from}, ${brand.to})`
              : "linear-gradient(135deg, #1a365d, #38a169)";
            return (
              <div
                key={offer.id}
                className="group relative rounded-2xl bg-white dark:bg-slate-900/80 border border-border/60 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col"
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ background: grad }}
                />
                <div className="p-4 flex flex-col gap-2.5 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {offer.merchantName}
                    </p>
                    <span
                      className="rounded-md px-2 py-0.5 text-[10px] font-extrabold text-white whitespace-nowrap"
                      style={{ background: grad }}
                    >
                      {offer.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold leading-snug flex-1">
                    {offer.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {offer.code && <OfferCode code={offer.code} />}
                    {!offer.code && offer.endsAt && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                        <Clock className="size-3" />
                        Limited time
                      </span>
                    )}
                  </div>
                  <a
                    href={getOfferLink(offer)}
                    target="_blank"
                    rel="noopener noreferrer nofollow sponsored"
                    className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#1a365d] to-[#38a169] hover:from-[#2a4a7f] hover:to-[#48bb78] text-white px-4 py-1.5 text-xs font-bold shadow-md transition-colors"
                  >
                    Get deal
                    <ArrowRight className="size-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
