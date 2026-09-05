import type { Metadata } from "next";
import { BadgePercent, Clock, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/seo";
import { getBrandColor } from "@/config/brand-colors";
import {
  getActiveOffers,
  getOfferLink,
  OFFER_CATEGORY_LABELS,
} from "@/lib/offers";
import { OffersGrid, type OfferCard } from "@/components/offers/offers-grid";
import {
  BreadcrumbJsonLd,
  FAQPageJsonLd,
  ItemListJsonLd,
} from "@/components/shared/json-ld";

/**
 * /offers — every live voucher code and promotion from our Awin
 * partners, hand-curated from the publisher dashboard. Static data
 * (src/lib/offers.ts), so the page ships with zero DB queries; the
 * coupon grid + category filter is a small client island.
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

const FAQS = [
  {
    question: "Are these voucher codes verified?",
    answer:
      "Yes — every code on this page comes directly from our official Awin partner programmes, not scraped from the web. We only list offers that advertisers have published to their affiliate partners, every link is checked to land on the right page, and expired offers are removed automatically.",
  },
  {
    question: "How do I use a voucher code?",
    answer:
      "Click the code to copy it, follow the deal link to the provider's offer page, and paste the code at checkout. Offers without a code are applied automatically on the provider's site.",
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

  const cards: OfferCard[] = offers.map((o) => {
    const brand = getBrandColor(o.merchant);
    return {
      id: o.id,
      merchantName: o.merchantName,
      merchantSlug: o.merchant,
      title: o.title,
      description: o.description,
      code: o.code,
      endsAt: o.endsAt ? formatEnds(o.endsAt) : undefined,
      category: o.category,
      categoryLabel: OFFER_CATEGORY_LABELS[o.category],
      badge: o.badge,
      href: getOfferLink(o),
      brandFrom: brand?.from ?? "#1a365d",
      brandTo: brand?.to ?? "#38a169",
    };
  });

  const codeCount = offers.filter((o) => o.code).length;

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
            broadband providers we partner with — hand-checked, deep-linked
            straight to each offer, with expired deals removed automatically.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/70">
            <span className="flex items-center gap-2">
              <BadgePercent className="size-4 text-emerald-300" />
              {offers.length} live offers · {codeCount} codes
            </span>
            <span className="flex items-center gap-2">
              <Clock className="size-4 text-emerald-300" />
              Expiry-checked daily
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-300" />
              Every link verified
            </span>
          </div>
        </div>
      </section>

      {/* Coupon grid with category filter */}
      <section className="bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
          <OffersGrid offers={cards} />
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
