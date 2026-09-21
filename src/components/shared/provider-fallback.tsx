import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AWIN_MERCHANTS, MERCHANT_HOMEPAGES, getMerchantLink, type AwinMerchantSlug } from "@/lib/affiliate";
import { getActiveOffers, getOfferLink } from "@/lib/offers";
import { ListingUnavailable } from "./listing-unavailable";

const names: Partial<Record<AwinMerchantSlug, string>> = { ttfone: "TTfone", voxi: "VOXI", "1pmobile": "1pMobile", "be-fibre": "Be Fibre", worldsim: "WorldSIM" };
export function getKnownPartner(slug: string) {
  if (!Object.hasOwn(AWIN_MERCHANTS, slug)) return null;
  const merchant = slug as AwinMerchantSlug;
  const name = names[merchant] ?? slug.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
  return { merchant, name, href: getMerchantLink(merchant, MERCHANT_HOMEPAGES[merchant], `provider_${slug}`) };
}

export function ProviderFallback({ partner }: { partner: NonNullable<ReturnType<typeof getKnownPartner>> }) {
  const offers = getActiveOffers().filter(offer => offer.merchant === partner.merchant);
  return <>
    <section className="page-banner px-4 py-14 sm:py-20"><div className="mx-auto max-w-6xl"><Link href="/providers" className="text-sm text-white/70 hover:text-white">All providers</Link><h1 className="mt-5 text-4xl sm:text-5xl">{partner.name} deals</h1><p className="mt-4 max-w-xl text-white/70">Explore partner promotions and check the latest plans directly with {partner.name}.</p><a href={partner.href} target="_blank" rel="sponsored nofollow noopener noreferrer" className="hero-primary mt-6">Visit {partner.name}<ArrowUpRight aria-hidden="true" className="size-4" /><span className="sr-only"> (opens in a new tab)</span></a><p className="mt-3 text-xs text-white/55">We may earn a commission when you buy through our links.</p></div></section>
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-12 sm:px-6">
      {offers.length > 0 && <section aria-label={`${partner.name} promotions`} className="grid gap-4 sm:grid-cols-2">{offers.map(offer => <a key={offer.id} href={getOfferLink(offer)} target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-2xl border bg-card p-6 transition-colors hover:border-primary"><h2 className="text-xl font-semibold">{offer.title}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{offer.description}</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">View offer<ArrowUpRight aria-hidden="true" className="size-4" /><span className="sr-only"> (opens in a new tab)</span></span></a>)}</section>}
      <ListingUnavailable description="The detailed plan comparison is temporarily unavailable. You can still browse the promotions above or check current prices on the retailer’s website." />
    </div>
  </>;
}
