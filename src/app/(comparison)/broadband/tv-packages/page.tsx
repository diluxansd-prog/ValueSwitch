import type { Metadata } from "next";
import Link from "next/link";
import { Tv, Wifi, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/seo";
import { BreadcrumbJsonLd, FAQPageJsonLd } from "@/components/shared/json-ld";

/**
 * /broadband/tv-packages — was linked from the nav and sitemap but the
 * page never existed (fell through to the [city] route's notFound()).
 * We don't yet have a TV-bundle partner on Awin, so this page is an
 * honest explainer + router to what we DO compare, rather than a fake
 * comparison table.
 */

export const metadata: Metadata = {
  title: "Broadband & TV Packages UK 2026 — What to Bundle and When",
  description:
    "Should you bundle broadband with TV in 2026? When bundles beat streaming, what full-fibre providers offer instead, and today's best fibre deals.",
  alternates: { canonical: `${siteConfig.url}/broadband/tv-packages` },
  openGraph: {
    type: "website",
    title: "Broadband & TV Packages UK — What to Bundle and When",
    description:
      "When a broadband + TV bundle beats streaming apps, and the best full-fibre deals to pair them with.",
    url: `${siteConfig.url}/broadband/tv-packages`,
  },
};

export const revalidate = 86400;

const FAQS = [
  {
    question: "Are broadband and TV bundles worth it in 2026?",
    answer:
      "Usually only if you want live sport or premium channels. For most households, a cheap full-fibre connection plus the streaming apps you actually use (iPlayer, Netflix, Disney+) now works out cheaper than a traditional bundle with a TV box and channel packs.",
  },
  {
    question: "Do altnet fibre providers offer TV packages?",
    answer:
      "Mostly no — alternative networks like Be Fibre, Quickline, Highland Broadband and Connect Fibre focus on fast, cheap broadband and let you stream TV over the top. Some offer add-ons like mesh WiFi or landline calling instead.",
  },
  {
    question: "What do I need to stream TV in 4K?",
    answer:
      "Around 25Mbps per 4K stream, reliably. Any full-fibre plan of 100Mbps+ comfortably handles multiple 4K streams at once — see our full-fibre deals from £20/month.",
  },
];

export default function TvPackagesPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Broadband", url: `${siteConfig.url}/broadband` },
          {
            name: "Broadband & TV",
            url: `${siteConfig.url}/broadband/tv-packages`,
          },
        ]}
      />
      <FAQPageJsonLd faqs={FAQS} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1a365d] via-[#4c1d95] to-[#0e7490] text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <Badge className="mb-4 bg-white/15 text-white border-0 backdrop-blur-sm">
            <Tv className="size-3.5 mr-1" />
            Broadband &amp; TV
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl">
            Broadband &amp; TV packages — bundle or stream?
          </h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-white/80 leading-relaxed">
            In 2026, a fast full-fibre line plus the streaming apps you
            actually watch usually beats a traditional TV bundle on price.
            Here&apos;s how to decide — and the fibre deals to build on.
          </p>
        </div>
      </section>

      {/* Decision guide */}
      <section className="bg-background">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-white dark:bg-slate-900/70 p-6 shadow-sm">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0e7490] to-[#38a169] text-white shadow-md mb-4">
                <Wifi className="size-5" />
              </div>
              <h2 className="text-lg font-bold mb-2">
                Stream over full fibre (most people)
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A 100Mbps+ full-fibre plan handles several 4K streams at
                once. Pay only for the apps you use, cancel any month, and
                keep your broadband bill from £20/month with our altnet
                partners.
              </p>
              <Button
                asChild
                className="mt-4 bg-gradient-to-r from-[#1a365d] to-[#38a169] hover:from-[#2a4a7f] hover:to-[#48bb78] text-white border-0 font-semibold shadow-md"
              >
                <Link href="/broadband/fibre">
                  See full-fibre deals
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="rounded-2xl border border-border/60 bg-white dark:bg-slate-900/70 p-6 shadow-sm">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#4c1d95] to-[#7c3aed] text-white shadow-md mb-4">
                <Tv className="size-5" />
              </div>
              <h2 className="text-lg font-bold mb-2">
                Bundle broadband + TV (sport &amp; premium channels)
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Live sport and premium channel packs are still cheapest
                inside a bundle. We don&apos;t compare TV bundles yet — we
                only list partners whose prices we can verify — but our
                broadband comparison keeps the connection half of the bill
                honest.
              </p>
              <Button
                asChild
                variant="outline"
                className="mt-4 font-semibold"
              >
                <Link href="/broadband">
                  Compare broadband
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-emerald-300/50 bg-emerald-50 dark:bg-emerald-950/30 p-5 text-sm text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
            <ShieldCheck className="size-5 shrink-0 mt-0.5" />
            <p>
              <span className="font-semibold">Why no TV bundle table?</span>{" "}
              We only compare deals from partners with verified live pricing.
              When a TV-bundle partner joins our network, this page will
              carry the comparison — until then we&apos;d rather point you
              at genuinely good fibre than pad a table.
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/offers"
              className="inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4"
            >
              <Sparkles className="size-4" />
              See all live offers &amp; voucher codes
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 dark:bg-slate-950 border-t">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
          <Badge className="mb-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-md">
            FAQ
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            Bundling questions
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
