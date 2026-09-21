import Link from "next/link";
import { ArrowRight, ArrowUpRight, ShieldCheck, Globe2, Smartphone } from "lucide-react";
import { getActiveOffers, getOfferLink } from "@/lib/offers";
import { IPhoneShowcase } from "./iphone-showcase";

// Retailer terms and artwork checked 21 September 2026. This campaign works
// independently of the feed and never quotes airtime as the handset price.
export function IPhone18Banner() {
  const offers = getActiveOffers();
  const maxOffer = offers.find((offer) => offer.id === "mozillion-iphone-18-pro-max");
  const proOffer = offers.find((offer) => offer.id === "mozillion-iphone-18-pro");
  if (!maxOffer) return null;

  return (
    <section id="iphone-promotions" aria-labelledby="iphone-promotion-title" className="bg-[#f5f4ef] py-12 sm:py-16 dark:bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div><p className="section-eyebrow">The upgrade edit</p><p className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Your next favourite phone.</p></div>
          <Link href="/mobile/contracts" className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium">Explore phone contracts <ArrowUpRight aria-hidden="true" className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>
        </div>
        <div className="iphone-campaign relative isolate overflow-hidden rounded-[28px] text-white sm:rounded-[36px]">
          <div className="relative grid items-center lg:grid-cols-[1.1fr_1fr]">
            <div className="relative z-10 px-6 pt-8 sm:px-10 sm:pt-12 lg:py-14 lg:pl-12 lg:pr-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e4bd9e]/30 bg-[#e4bd9e]/10 px-3 py-1.5 text-[11px] font-medium tracking-[.14em] text-[#f0cdb1] uppercase"><span aria-hidden="true" className="size-1.5 rounded-full bg-[#f0cdb1]" />Featured partner promotion</span>
              <h2 id="iphone-promotion-title" className="mt-6 text-[2.65rem] font-semibold leading-[1.06] tracking-[-.05em] sm:text-6xl">iPhone 18<br /><span className="text-[#edc8ad]">Pro Max.</span></h2>
              <p className="mt-5 text-xl font-medium tracking-tight sm:text-2xl">A big upgrade. A smarter deal.</p>
              <p className="mt-3 max-w-md text-sm leading-7 text-white/65 sm:text-base">Explore Mozillion contracts with no mid-contract price rises. Find your data, choose your plan, and make the upgrade yours.</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a href={getOfferLink(maxOffer)} target="_blank" rel="sponsored nofollow noopener noreferrer" className="campaign-action inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#edc8ad] px-5 py-3 text-sm font-semibold text-[#28221d] hover:bg-[#f5dbc7]">View Mozillion offer <ArrowUpRight aria-hidden="true" className="size-4" /><span className="sr-only"> (opens in a new tab)</span></a>
                <Link href="/best/iphone-18-deals-uk" className="campaign-action inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-white/25 px-5 py-3 text-sm font-medium hover:bg-white/10">Compare iPhone 18 deals <ArrowRight aria-hidden="true" className="size-4" /></Link>
              </div>
              <p className="mt-4 max-w-md text-xs leading-5 text-white/50">Affiliate link · We may earn a commission. Confirm the monthly price, upfront cost, term and availability with Mozillion.</p>
            </div>
            <IPhoneShowcase />
          </div>
          <div className="relative grid gap-4 border-t border-white/10 bg-black/15 px-6 py-5 text-sm sm:grid-cols-3 sm:px-10 lg:px-12">
            {[{ icon: ShieldCheck, title: "Price stays put", detail: "No mid-contract price rises" }, { icon: Globe2, title: "Take your plan further", detail: "EU roaming included" }, { icon: Smartphone, title: "Choose your fit", detail: "Data and storage options" }].map(({icon: Icon, title, detail}) => <div key={title} className="flex items-center gap-3"><Icon aria-hidden="true" className="size-5 shrink-0 text-[#edc8ad]" /><div><p className="font-medium">{title}</p><p className="mt-0.5 text-xs text-white/55">{detail}</p></div></div>)}
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {proOffer && <a href={getOfferLink(proOffer)} target="_blank" rel="sponsored nofollow noopener noreferrer" className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-5 py-5 transition-colors hover:border-[#9b7960]"><div><p className="text-xs text-muted-foreground">Another way to go Pro · Mozillion</p><p className="mt-1 font-semibold">Explore iPhone 18 Pro</p></div><ArrowUpRight aria-hidden="true" className="size-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /><span className="sr-only"> (affiliate link, opens in a new tab)</span></a>}
          <Link href="/best/cheapest-iphone-uk" className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-5 py-5 transition-colors hover:border-[#9b7960]"><div><p className="text-xs text-muted-foreground">More iPhone. More choice.</p><p className="mt-1 font-semibold">Compare iPhone models & prices</p></div><ArrowRight aria-hidden="true" className="size-5 transition-transform group-hover:translate-x-1" /></Link>
        </div>
      </div>
    </section>
  );
}
