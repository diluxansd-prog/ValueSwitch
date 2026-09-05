import type { Metadata } from "next";
import {
  BadgePercent,
  Clock,
  ExternalLink,
  Plane,
  Smartphone,
  Sparkles,
  Wifi,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/seo";
import { getBrandColor } from "@/config/brand-colors";
import {
  getActiveOffers,
  getOfferLink,
  OFFER_CATEGORY_LABELS,
  type OfferCategory,
} from "@/lib/offers";
import { OfferCode } from "@/components/shared/offer-code";
import {
  BreadcrumbJsonLd,
  FAQPageJsonLd,
  ItemListJsonLd,
} from "@/components/shared/json-ld";

/**
 * /offers — every live voucher code and promotion from our Awin
 * partners, hand-curated from the publisher dashboard. Static data
 * (src/lib/offers.ts), so the page ships with zero DB queries.
 */

export const metadata: Metadata = {
  title: "UK Mobile & Broadband Offers + Voucher Codes",
  description:
    "Live voucher codes and offers from Lebara, VOXI, Vodafone, Quickline and more. 50% off SIM plans, £300 broadband switching rewards, 80% off travel eSIMs.",
  alternates: { canonical: `${siteConfig.url}/offers` },
  openGraph: {
    title: "UK Mobile & Broadband Offers + Voucher Codes",
    description:
      "Hand-checked voucher codes and promotions from our UK network and broadband partners — updated from live affiliate feeds.",
    url: `${siteConfig.url}/offers`,
  },
};

// Offer end-dates make this page time-sensitive — revalidate daily so
// expired offers disappear without a redeploy.
export const revalidate = 86400;

const CATEGORY_ORDER: OfferCategory[] = [
  "sim",
  "broadband",
  "travel-esim",
  "phones",
];

const CATEGORY_ICONS: Record<OfferCategory, typeof Smartphone> = {
  sim: Smartphone,
  broadband: Wifi,
  "travel-esim": Plane,
  phones: BadgePercent,
};

const FAQS = [
  {
    question: "Are these voucher codes verified?",
    answer:
      "Yes — every code on this page comes directly from our official Awin partner programmes, not scraped from the web. We only list offers that advertisers have published to their affiliate partners, and expired offers are removed automatically.",
  },
  {
    question: "How do I use a voucher code?",
    answer:
      "Click the code to copy it, follow the deal link to the provider's site, and paste the code at checkout. Offers without a code are applied automatically on the provider's site.",
  },
  {
    question: "Does ValueSwitch earn commission on these offers?",
    answer:
      "Yes. If you buy through our links we may earn a commission from the provider at no extra cost to you — it's how we keep the comparison service free. It never affects the price you pay or which offers we list.",
  },
];

function formatEnds(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function OffersPage() {
  const offers = getActiveOffers();
  const byCategory = CATEGORY_ORDER.map((cat) => ({
    cat,
    label: OFFER_CATEGORY_LABELS[cat],
    items: offers.filter((o) => o.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Offers & Voucher Codes", url: `${siteConfig.url}/offers` },
        ]}
      />
      <ItemListJsonLd
        name="UK Mobile & Broadband Offers"
        url={`${siteConfig.url}/offers`}
        items={offers.map((o) => ({
          name: `${o.merchantName} — ${o.title}`,
          url: `${siteConfig.url}/offers#${o.id}`,
        }))}
      />
      <FAQPageJsonLd faqs={FAQS} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1a365d] via-[#234876] to-[#38a169] text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <Badge className="mb-4 bg-white/15 text-white border-0 backdrop-blur-sm">
            <Sparkles className="size-3.5 mr-1" />
            Updated from live Awin partner feeds
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl">
            Offers &amp; voucher codes from our UK partners
          </h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-white/80 leading-relaxed">
            Every live promotion and discount code from the networks and
            broadband providers we partner with — hand-checked, with expired
            offers removed automatically. Click a code to copy it.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/70">
            <span className="flex items-center gap-2">
              <BadgePercent className="size-4 text-emerald-300" />
              {offers.length} live offers
            </span>
            <span className="flex items-center gap-2">
              <Clock className="size-4 text-emerald-300" />
              Expiry-checked daily
            </span>
          </div>
        </div>
      </section>

      {/* Offer groups */}
      <section className="bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900/40 dark:via-slate-950 dark:to-slate-900/40">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14 space-y-12">
          {byCategory.map(({ cat, label, items }) => {
            const Icon = CATEGORY_ICONS[cat];
            return (
              <div key={cat}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a365d] to-[#38a169] text-white shadow-md">
                    <Icon className="size-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold">{label}</h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {items.map((offer) => {
                    const brand = getBrandColor(offer.merchant);
                    const grad = brand
                      ? `linear-gradient(135deg, ${brand.from}, ${brand.to})`
                      : "linear-gradient(135deg, #1a365d, #38a169)";
                    return (
                      <div
                        key={offer.id}
                        id={offer.id}
                        className="group relative rounded-2xl bg-white dark:bg-slate-900/80 border border-border/60 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col"
                      >
                        <div
                          className="absolute left-0 top-0 bottom-0 w-1"
                          style={{ background: grad }}
                        />
                        <div className="p-5 flex flex-col gap-3 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                {offer.merchantName}
                              </p>
                              <h3 className="text-base font-bold leading-snug mt-0.5">
                                {offer.title}
                              </h3>
                            </div>
                            <span
                              className="shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-extrabold text-white shadow-sm whitespace-nowrap"
                              style={{ background: grad }}
                            >
                              {offer.badge}
                            </span>
                          </div>

                          <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                            {offer.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 pt-1">
                            {offer.code && <OfferCode code={offer.code} />}
                            {offer.endsAt && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                                <Clock className="size-3" />
                                Ends {formatEnds(offer.endsAt)}
                              </span>
                            )}
                            <a
                              href={getOfferLink(offer)}
                              target="_blank"
                              rel="noopener noreferrer nofollow sponsored"
                              className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#1a365d] to-[#38a169] hover:from-[#2a4a7f] hover:to-[#48bb78] text-white px-4 py-1.5 text-xs font-bold shadow-md transition-colors"
                            >
                              Get deal
                              <ExternalLink className="size-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-background border-t">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
          <Badge className="mb-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-md">
            FAQ
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            About these offers
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl bg-white dark:bg-slate-900/60 border border-border/50 p-5 shadow-sm hover:shadow-md transition-all"
              >
                <summary className="cursor-pointer text-base font-bold flex items-start justify-between gap-3">
                  <span>{faq.question}</span>
                  <span className="shrink-0 size-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center text-xs font-extrabold group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
