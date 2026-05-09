import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Award,
  TrendingUp,
  Lock,
  Building2,
  Mail,
  ArrowRight,
  Check,
  Smartphone,
  Wifi,
  CardSim,
  Zap,
  FileText,
  Globe2,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { COMPANY } from "@/lib/constants";
import { siteConfig } from "@/config/seo";
import { BreadcrumbJsonLd } from "@/components/shared/json-ld";

/**
 * /for-advertisers — the page Awin merchant managers see when reviewing
 * a partnership application.
 *
 * The page that exists *before* this one is the homepage, which sells
 * to consumers. Merchant managers reviewing an application want to see:
 *   1. Is this a real registered business?
 *   2. What kind of publisher are they (comparison, content, voucher,
 *      cashback, social)?
 *   3. Editorial standards (real prices, no fake savings, FCA-friendly).
 *   4. Audience — who clicks through, and how much traffic.
 *   5. Compliance — GDPR, cookie consent, brand safety.
 *   6. Sample placements — what does a partner's listing look like.
 *
 * Without this page, "publisher type" rejections happen because the
 * merchant has to figure out what kind of publisher we are from the
 * homepage alone — and price-comparison sites that look "consumer-y"
 * often get categorised as voucher or cashback by default and rejected
 * for not meeting those programmes' criteria.
 */

export const metadata: Metadata = {
  title: "For Advertisers — Partner with ValueSwitch UK",
  description:
    "ValueSwitch is a registered UK price comparison publisher (Companies House 17108611). Honest editorial standards, GDPR-compliant, brand-safe placement. Apply to partner with us.",
  alternates: { canonical: `${siteConfig.url}/for-advertisers` },
  openGraph: {
    title: "Partner with ValueSwitch — UK Price Comparison",
    description:
      "Honest UK price comparison. Real prices from Awin partner feeds. Registered UK company. GDPR compliant.",
    url: `${siteConfig.url}/for-advertisers`,
    type: "website",
  },
};

export const dynamic = "force-dynamic";

async function getPlatformStats() {
  try {
    const [totalPlans, activeProviders, totalGuides, lastImport] =
      await Promise.all([
        prisma.plan.count(),
        prisma.provider.count({ where: { isActive: true } }),
        prisma.guide
          .count({ where: { isPublished: true } })
          .catch(() => 11),
        prisma.plan.findFirst({
          orderBy: { updatedAt: "desc" },
          select: { updatedAt: true },
        }),
      ]);
    return {
      totalPlans,
      activeProviders,
      totalGuides,
      lastImport: lastImport?.updatedAt ?? null,
    };
  } catch {
    return {
      totalPlans: 0,
      activeProviders: 0,
      totalGuides: 11,
      lastImport: null,
    };
  }
}

export default async function ForAdvertisersPage() {
  const stats = await getPlatformStats();

  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "For advertisers", url: `${siteConfig.url}/for-advertisers` },
        ]}
      />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0a1628] via-[#1a365d] to-[#2a4a7f] text-white overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white border-0 shadow-lg">
              <Sparkles className="size-3 mr-1" />
              For Awin merchants &amp; brand managers
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Partner with ValueSwitch
            </h1>
            <p className="mt-5 text-lg text-blue-100/90 leading-relaxed max-w-2xl">
              ValueSwitch is a UK-registered price comparison publisher
              specialising in mobile and broadband. Honest editorial
              standards, real prices from your live affiliate feed, and a
              brand-safe placement environment.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                asChild
                className="bg-white text-[#1a365d] hover:bg-blue-50 font-bold px-8 shadow-lg"
              >
                <a
                  href={`mailto:${COMPANY.email.support}?subject=Awin%20partnership%20enquiry`}
                >
                  <Mail className="size-5" />
                  Contact partnerships team
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/40 bg-white/10 backdrop-blur text-white hover:bg-white/20 font-bold px-8"
              >
                <Link href="#how-we-work">
                  How we work
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Live platform stats — real social proof */}
      <section className="border-b bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900/40 dark:via-slate-900/20 dark:to-slate-900/40">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              {
                icon: TrendingUp,
                value: stats.totalPlans.toLocaleString("en-GB"),
                label: "Live deals indexed",
                grad: "from-emerald-500 to-emerald-700",
              },
              {
                icon: Building2,
                value: stats.activeProviders.toString(),
                label: "Active retailers",
                grad: "from-blue-500 to-blue-700",
              },
              {
                icon: FileText,
                value: stats.totalGuides.toString(),
                label: "Editorial guides",
                grad: "from-purple-500 to-purple-700",
              },
              {
                icon: Globe2,
                value: "UK",
                label: "Audience focus",
                grad: "from-amber-500 to-orange-600",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="text-center sm:text-left flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div
                  className={`mx-auto sm:mx-0 size-11 rounded-xl bg-gradient-to-br ${s.grad} text-white flex items-center justify-center shadow-lg shrink-0`}
                >
                  <s.icon className="size-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold tabular-nums">
                    {s.value}
                  </div>
                  <div className="text-[11px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Publisher type — explicit categorisation for Awin reviewers */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="text-center mb-10">
            <Badge className="mb-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-md">
              Publisher classification
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold">
              We are a comparison + content publisher
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Not voucher, not cashback, not closed user-group. Knowing this
              upfront avoids the &ldquo;wrong publisher type&rdquo; mismatch
              when matching to a programme.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: TrendingUp,
                title: "Price comparison",
                grad: "from-emerald-500 to-teal-600",
                bg: "from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40",
                desc: "Side-by-side comparison of UK mobile and broadband plans. Sortable by price, data, contract length, network. Live affiliate prices, refreshed weekly.",
              },
              {
                icon: FileText,
                title: "Editorial content",
                grad: "from-blue-500 to-indigo-600",
                bg: "from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40",
                desc: "11+ pillar articles on UK switching, EU roaming, refurbished phones, network comparisons, mid-contract price rises. Long-form buyer's guides.",
              },
              {
                icon: Eye,
                title: "Programmatic landing pages",
                grad: "from-purple-500 to-fuchsia-600",
                bg: "from-purple-50 to-fuchsia-50 dark:from-purple-950/40 dark:to-fuchsia-950/40",
                desc: "26+ programmatic landing pages targeting UK long-tail searches: city broadband, sub-£10 SIM-only, head-to-head comparisons, cheapest-by-brand pages.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className={`relative rounded-2xl bg-gradient-to-br ${card.bg} border border-border/50 p-6 shadow-sm hover:shadow-lg transition-all overflow-hidden`}
              >
                <div
                  className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${card.grad}`}
                />
                <div
                  className={`flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${card.grad} text-white shadow-md mb-3`}
                >
                  <card.icon className="size-5" />
                </div>
                <h3 className="font-bold mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we are NOT — handles common categorisation mismatches */}
      <section className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/40 dark:to-slate-950 border-y">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center">
            What ValueSwitch is not
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Programmes restricted to specific publisher types — these are
            categories we explicitly don&apos;t fit, so the &ldquo;wrong
            type&rdquo; rejection doesn&apos;t apply.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "Voucher / coupon site",
              "Cashback platform",
              "Closed user-group / loyalty club",
              "Email / SMS list reseller",
              "Toolbar / browser extension",
              "Adware / popup network",
              "Incentivised traffic / paid-to-click",
              "Sub-network / aggregator",
            ].map((thing) => (
              <div
                key={thing}
                className="flex items-center gap-2 rounded-lg border border-border/40 bg-background p-3 text-sm"
              >
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
                  ×
                </div>
                <span className="text-muted-foreground">{thing}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How we work — editorial standards */}
      <section id="how-we-work" className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="text-center mb-10">
            <Badge className="mb-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-md">
              <ShieldCheck className="size-3 mr-1" />
              Editorial standards
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold">How we work</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              The five things every brand manager wants to see before
              approving a comparison publisher.
            </p>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            {[
              {
                icon: Award,
                title: "Real prices, never invented",
                desc: "Every deal comes from your live Awin product feed. We don't pad prices to inflate apparent savings. We don't show expired offers. Last-import timestamp is shown publicly on the home page.",
              },
              {
                icon: TrendingUp,
                title: "Weekly automated refresh",
                desc: "Vercel cron pulls every Awin partner feed every Sunday at 03:00 UTC. Price drops show up automatically; expired SKUs get retired. Manual refresh available for time-sensitive promo windows — just let us know.",
              },
              {
                icon: ShieldCheck,
                title: "Honest commission disclosure",
                desc: "Every deal page shows a 'We may earn a commission' disclosure above the click-out CTA. Affiliate-link decisions never affect editorial ranking. Best-value badges are awarded by price, not by commission rate.",
              },
              {
                icon: Lock,
                title: "GDPR-compliant cookie consent",
                desc: "Cookie consent banner blocks all non-essential cookies until the user opts in. Third-party trackers are limited to Vercel Analytics (essential). No selling of email addresses or browsing data.",
              },
              {
                icon: Sparkles,
                title: "Brand-safe placement",
                desc: "No popups, no auto-play video, no incentivised traffic, no adult or gambling content adjacent. Each merchant's brand colours are honoured in their card design. Logos and trademarks used only with attribution.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-2xl border border-border/50 bg-white dark:bg-slate-900/60 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a365d] to-[#38a169] text-white shadow-md">
                  <item.icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories we cover */}
      <section className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/40 dark:to-slate-950 border-y">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">
            Categories we cover
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Mobile and broadband are our primary focus. We can integrate
            adjacent telco categories on request.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Smartphone,
                title: "Phone contracts",
                grad: "from-blue-500 to-indigo-600",
                desc: "iPhone, Galaxy, Pixel, OnePlus, Xiaomi etc.",
              },
              {
                icon: CardSim,
                title: "SIM-only",
                grad: "from-orange-500 to-amber-600",
                desc: "Pay-monthly + 30-day rolling",
              },
              {
                icon: Wifi,
                title: "Broadband",
                grad: "from-purple-500 to-fuchsia-600",
                desc: "Full-fibre, ultrafast, superfast",
              },
              {
                icon: Zap,
                title: "Refurbished",
                grad: "from-emerald-500 to-teal-600",
                desc: "Certified-refurb iPhone, Galaxy, Pixel",
              },
            ].map((cat) => (
              <div
                key={cat.title}
                className="rounded-2xl border border-border/50 bg-white dark:bg-slate-900/60 p-5 shadow-sm"
              >
                <div
                  className={`flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${cat.grad} text-white shadow-md mb-3`}
                >
                  <cat.icon className="size-5" />
                </div>
                <h3 className="font-bold">{cat.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {cat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance + tech */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <Badge className="mb-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-md">
                Compliance
              </Badge>
              <h2 className="text-2xl font-bold mb-4">
                Compliance &amp; brand safety
              </h2>
              <ul className="space-y-3">
                {[
                  "GDPR-compliant cookie consent (essential cookies only by default)",
                  "FCA-friendly disclosures on financial products (when applicable)",
                  "Companies House registered: VALUESWITCH LIMITED, #" +
                    COMPANY.companyNumber,
                  "UK-based registered office (Coventry)",
                  "Affiliate disclosure on every deal page",
                  "Awin clickref tracking on every outbound link",
                  "No adult / gambling / hate / extremist content",
                  "Trademarks used only with attribution",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="size-4 mt-0.5 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <Badge className="mb-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-md">
                Tech &amp; integration
              </Badge>
              <h2 className="text-2xl font-bold mb-4">How we integrate</h2>
              <ul className="space-y-3">
                {[
                  "Awin CSV product feeds (gzipped) — automated weekly cron",
                  "Awin cread.php deeplink format with clickref/clickref2/clickref3 sub-IDs",
                  "Per-deal IndexNow ping for Bing/Yandex/DuckDuckGo on new SKUs",
                  "Schema.org Product + Offer markup on every deal page",
                  "Mobile-first responsive design (Core Web Vitals: Good)",
                  "Server-rendered (Next.js + Vercel edge network) for low TTFB",
                  "OpenGraph dynamic images per deal — better social-share CTR",
                  "Sitemap.xml regenerated on every request — new deals indexed within hours",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="size-4 mt-0.5 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Awin publisher details — for the merchant manager */}
      <section className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="mb-3 bg-white/15 text-white border-white/20 backdrop-blur-sm">
                Awin publisher
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                Approve us in 60 seconds
              </h2>
              <p className="text-white/90 leading-relaxed">
                Look us up in your Awin dashboard with the publisher ID
                below. Our profile, traffic, and approval history live
                there. If you need anything else to approve our application
                — a screenshot of a sample placement, a competitor
                comparison, a brand-fit explainer — just email us.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur p-6 border border-white/20">
              <div className="space-y-3 text-sm">
                <Row label="Publisher name" value="ValueSwitch" />
                <Row label="Awin publisher ID" value="2798806" />
                <Row label="Legal entity" value={COMPANY.legalName} />
                <Row label="Companies House" value={"#" + COMPANY.companyNumber} />
                <Row label="Registered address" value={COMPANY.address.full} />
                <Row label="Primary URL" value="valueswitch.co.uk" />
                <Row label="Publisher type" value="Comparison + content" />
                <Row label="Audience" value="UK consumers" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA — get in touch */}
      <section className="bg-background">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Ready to onboard?
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Whether your programme is on Awin already or you&apos;re joining
            via another network, get in touch and we&apos;ll get your live
            prices on ValueSwitch within 48 hours of approval.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Button
              size="lg"
              asChild
              className="bg-gradient-to-r from-[#1a365d] to-[#38a169] text-white hover:from-[#2a4a7f] hover:to-[#48bb78] font-bold px-8 shadow-lg"
            >
              <a
                href={`mailto:${COMPANY.email.support}?subject=Awin%20partnership%20enquiry`}
              >
                <Mail className="size-5" />
                Email partnerships team
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="font-bold">
              <a
                href="https://www.awin.com/gb/publishers/find-a-publisher/2798806"
                target="_blank"
                rel="noopener noreferrer"
              >
                View us on Awin
                <ArrowRight className="size-4" />
              </a>
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            UK partnerships team responds within 1 working day
            ({COMPANY.hours}).
          </p>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-white/10 last:border-0 pb-2 last:pb-0">
      <span className="text-xs uppercase tracking-wider text-white/60 font-bold">
        {label}
      </span>
      <span className="font-mono text-sm font-bold text-right">{value}</span>
    </div>
  );
}
