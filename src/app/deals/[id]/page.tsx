import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ExternalLink,
  TrendingUp,
  Star,
  Check,
  ArrowRight,
  Smartphone,
  Signal,
  MessageSquare,
  HardDrive,
  Calendar,
  CreditCard,
  Wifi,
  Shield,
  ShieldCheck,
  Sparkles,
  Lock,
  Award,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "@/components/shared/star-rating";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ShareButtons } from "@/components/shared/share-buttons";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/shared/json-ld";
import { PriceTrend } from "@/components/shared/price-change-badge";
import {
  getDealBySlug,
  getSimilarDeals,
  getAllDealSlugs,
} from "@/lib/services/deal.service";
import { formatPrice } from "@/lib/constants";
import { siteConfig } from "@/config/seo";
import {
  getProviderColor,
  getProviderInitials,
} from "@/lib/utils/provider-avatar";
import { ProviderLogo } from "@/components/shared/provider-logo";
import { getBrandColor } from "@/config/brand-colors";
import { cn } from "@/lib/utils";

interface DealDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllDealSlugs();
  return slugs.map((slug) => ({ id: slug }));
}

export async function generateMetadata({
  params,
}: DealDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const deal = await getDealBySlug(id);
  if (!deal) return { title: "Deal Not Found" };
  return {
    title: `${deal.provider.name} ${deal.name} - ${formatPrice(deal.monthlyCost)}/mo`,
    description: `${deal.provider.name} ${deal.name}: ${formatPrice(deal.monthlyCost)}/month. ${deal.description ?? `Compare this ${deal.category} deal and switch today.`}`,
    alternates: { canonical: `${siteConfig.url}/deals/${id}` },
  };
}

export default async function DealDetailPage({
  params,
}: DealDetailPageProps) {
  const { id } = await params;
  const deal = await getDealBySlug(id);
  if (!deal) notFound();

  const similarDeals = await getSimilarDeals(deal.id, deal.category, 4);

  let features: string[] = [];
  if (deal.features) {
    try {
      features = JSON.parse(deal.features);
    } catch {
      features = deal.features.split(",").map((f: string) => f.trim());
    }
  }

  const dealUrl = `/deals/${id}`;
  const brand = getBrandColor(deal.provider.slug);
  const heroFrom = brand?.from ?? "#1a365d";
  const heroTo = brand?.to ?? "#2a4a7f";

  // Quick stat cards for mobile deals
  const quickStats = [
    {
      icon: HardDrive,
      label: "Data",
      value: deal.dataAllowance || "—",
      grad: "from-blue-500 to-indigo-600",
    },
    {
      icon: Signal,
      label: "Minutes",
      value: deal.minutes || "—",
      grad: "from-emerald-500 to-emerald-700",
    },
    {
      icon: MessageSquare,
      label: "Texts",
      value: deal.texts || "—",
      grad: "from-purple-500 to-fuchsia-600",
    },
    {
      icon: Wifi,
      label: "Network",
      value: deal.networkType || "—",
      grad: "from-orange-500 to-amber-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      <ProductJsonLd
        name={`${deal.provider.name} ${deal.name}`}
        description={deal.description ?? undefined}
        provider={deal.provider.name}
        price={deal.monthlyCost}
        category={deal.category}
        url={`${siteConfig.url}${dealUrl}`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          {
            name: deal.provider.name,
            url: `${siteConfig.url}/providers/${deal.provider.slug}`,
          },
          { name: deal.name, url: `${siteConfig.url}${dealUrl}` },
        ]}
      />

      {/* Hero — brand-coloured gradient with animated decoration */}
      <section
        className="relative pb-24 pt-8 text-white overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${heroFrom} 0%, ${heroTo} 60%, #0a1628 120%)`,
        }}
      >
        {/* Animated halos */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/5 blur-3xl animate-pulse"
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

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Mobile", href: "/mobile" },
              {
                label: deal.provider.name,
                href: `/providers/${deal.provider.slug}`,
              },
              { label: "Deal" },
            ]}
            className="mb-6 [&_a]:text-white/70 [&_a:hover]:text-white [&_span]:text-white/70 [&_[aria-current]]:text-white [&_svg]:text-white/60"
          />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1 max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-xl bg-white/15 backdrop-blur-sm p-1.5 ring-1 ring-white/20">
                  <ProviderLogo
                    name={deal.provider.name}
                    slug={deal.provider.slug}
                    logo={deal.provider.logo}
                    size={44}
                  />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-white/80">
                    {deal.provider.name}
                  </p>
                  {deal.provider.trustScore !== null && (
                    <StarRating
                      rating={deal.provider.trustScore}
                      size={12}
                      showValue
                      reviewCount={deal.provider.reviewCount}
                    />
                  )}
                </div>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                {deal.name.replace(/ - £[\d.]+\/mo.*/, "")}
              </h1>
              <div className="mt-4 flex flex-wrap gap-2">
                {deal.isBestValue && (
                  <Badge className="bg-gradient-to-r from-emerald-400 to-emerald-600 text-white border-0 shadow-lg">
                    <Award className="mr-1 size-3" />
                    Best value
                  </Badge>
                )}
                {deal.isPopular && (
                  <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 shadow-lg">
                    <Star className="mr-1 size-3 fill-current" />
                    Popular pick
                  </Badge>
                )}
                {deal.includesHandset && deal.handsetModel && (
                  <Badge className="bg-white/15 text-white backdrop-blur-sm border-white/20">
                    <Smartphone className="mr-1 size-3" />
                    {deal.handsetModel}
                  </Badge>
                )}
                {deal.networkType && (
                  <Badge className="bg-white/15 text-white backdrop-blur-sm border-white/20">
                    <Wifi className="mr-1 size-3" />
                    {deal.networkType}
                  </Badge>
                )}
                {deal.contractLength && (
                  <Badge className="bg-white/15 text-white backdrop-blur-sm border-white/20">
                    <Calendar className="mr-1 size-3" />
                    {deal.contractLength}-month
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {deal.imageUrl && (
                <div className="hidden sm:block relative size-32 lg:size-40 bg-white/10 rounded-2xl p-2 backdrop-blur-sm ring-1 ring-white/20 shadow-2xl">
                  <Image
                    src={deal.imageUrl}
                    alt={deal.name}
                    fill
                    className="object-contain p-2"
                    sizes="160px"
                  />
                </div>
              )}
              <ShareButtons
                title={`${deal.provider.name} ${deal.name}`}
                url={dealUrl}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Floating content area */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Headline price card */}
            <Card className="shadow-2xl border-0 overflow-hidden">
              <div
                className="px-6 py-2 text-white text-xs font-bold uppercase tracking-wider"
                style={{
                  background: `linear-gradient(90deg, ${heroFrom}, ${heroTo})`,
                }}
              >
                Awin verified — live affiliate price
              </div>
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">
                      Monthly cost
                    </p>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-2xl font-semibold text-muted-foreground">
                        £
                      </span>
                      <span
                        className="text-6xl font-extrabold tracking-tight tabular-nums bg-clip-text text-transparent"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${heroFrom}, ${heroTo})`,
                        }}
                      >
                        {deal.monthlyCost.toFixed(2)}
                      </span>
                      <span className="text-lg text-muted-foreground font-medium">
                        /mo
                      </span>
                    </div>
                    {deal.annualCost !== null && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Total over contract:{" "}
                        <span className="font-bold text-foreground">
                          {formatPrice(deal.annualCost)}
                        </span>
                        {deal.contractLength && (
                          <span> ({deal.contractLength} months)</span>
                        )}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-3 sm:items-end">
                    {deal.setupFee > 0 ? (
                      <div className="flex items-center gap-2 text-sm rounded-lg bg-amber-50 dark:bg-amber-950/40 px-3 py-2 ring-1 ring-amber-200/60 dark:ring-amber-900/40">
                        <CreditCard className="size-4 text-amber-600" />
                        <span>
                          Upfront:{" "}
                          <span className="font-bold">
                            {formatPrice(deal.setupFee)}
                          </span>
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm rounded-lg bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 ring-1 ring-emerald-200/60 dark:ring-emerald-900/40 text-emerald-700 dark:text-emerald-400">
                        <Check className="size-4" />
                        <span className="font-bold">No upfront cost</span>
                      </div>
                    )}
                    {deal.contractLength && (
                      <div className="flex items-center gap-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2">
                        <Calendar className="size-4 text-muted-foreground" />
                        <span className="font-medium">
                          {deal.contractLength}-month contract
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Grid — gradient icon tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickStats.map((stat) => (
                <Card
                  key={stat.label}
                  className="border-0 shadow-sm hover:shadow-md transition-all"
                >
                  <CardContent className="p-4 text-center">
                    <div
                      className={`mx-auto mb-2 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${stat.grad} text-white shadow-md`}
                    >
                      <stat.icon className="size-5" />
                    </div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-sm font-extrabold mt-0.5">
                      {stat.value}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Features */}
            {features.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
                      <Shield className="size-4" />
                    </div>
                    What&apos;s included
                  </h2>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-sm">
                          <Check className="size-3" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            {deal.description && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Sparkles className="size-5 text-purple-500" />
                    About this deal
                  </h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {deal.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Trust strip */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-slate-50 to-emerald-50 dark:from-slate-900/40 dark:to-emerald-950/40">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
                      <ShieldCheck className="size-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Awin verified</p>
                      <p className="text-xs text-muted-foreground">
                        Live affiliate feed
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                      <Lock className="size-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">No price padding</p>
                      <p className="text-xs text-muted-foreground">
                        What you see is what you pay
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
                      <Sparkles className="size-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Updated weekly</p>
                      <p className="text-xs text-muted-foreground">
                        Sunday 03:00 UTC refresh
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Sticky CTA Sidebar */}
          <div className="space-y-4">
            <Card className="sticky top-20 shadow-2xl border-0 overflow-hidden">
              <div
                className="p-5 text-center text-white"
                style={{
                  background: `linear-gradient(135deg, ${heroFrom}, ${heroTo})`,
                }}
              >
                <p className="text-xs font-bold uppercase tracking-wider opacity-90">
                  Best price right now
                </p>
                <div className="flex items-baseline justify-center gap-0.5 mt-2">
                  <span className="text-xl font-bold">£</span>
                  <span className="text-5xl font-extrabold tabular-nums">
                    {deal.monthlyCost.toFixed(2)}
                  </span>
                  <span className="text-sm opacity-90">/mo</span>
                </div>
                {deal.dataAllowance && (
                  <p className="text-xs opacity-90 mt-1">
                    {deal.dataAllowance} data
                    {deal.contractLength
                      ? ` • ${deal.contractLength} months`
                      : ""}
                  </p>
                )}
              </div>
              <CardContent className="p-5 space-y-4">
                {deal.priceHistory && deal.priceHistory.length > 0 && (
                  <div className="rounded-lg bg-muted/40 px-3 py-2">
                    <PriceTrend
                      history={deal.priceHistory.map((h) => ({
                        monthlyCost: h.monthlyCost,
                        recordedAt: h.recordedAt,
                      }))}
                      currentPrice={deal.monthlyCost}
                    />
                  </div>
                )}
                <Button
                  asChild
                  className="w-full h-12 text-base bg-gradient-to-r from-[#38a169] to-[#48bb78] text-white hover:from-[#2f8a5a] hover:to-[#38a169] shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all font-bold"
                  size="lg"
                >
                  <a
                    href={`/api/redirect?plan=${deal.id}&src=deal_page`}
                    target="_blank"
                    rel="noopener noreferrer nofollow sponsored"
                  >
                    Go to {deal.provider.name}
                    <ExternalLink className="ml-2 size-4" />
                  </a>
                </Button>
                <p className="text-center text-[11px] text-muted-foreground leading-snug">
                  You&apos;ll be redirected to {deal.provider.name}&apos;s
                  website. We may earn an affiliate commission — it never
                  changes the price you pay.
                </p>
                <Separator />
                <div className="flex items-center gap-3">
                  <ProviderLogo
                    name={deal.provider.name}
                    slug={deal.provider.slug}
                    logo={deal.provider.logo}
                    size={40}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{deal.provider.name}</p>
                    {deal.provider.trustScore !== null && (
                      <StarRating
                        rating={deal.provider.trustScore}
                        size={11}
                        showValue
                        reviewCount={deal.provider.reviewCount}
                      />
                    )}
                  </div>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Link href={`/providers/${deal.provider.slug}`}>
                    View all {deal.provider.name} plans
                    <ArrowRight className="ml-1 size-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Similar Deals */}
      {similarDeals.length > 0 && (
        <section className="mt-16 border-t bg-gradient-to-b from-white to-slate-50 dark:from-background dark:to-slate-900/40 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Badge className="mb-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white border-0 shadow-md">
              <TrendingUp className="size-3 mr-1" />
              You might also like
            </Badge>
            <h2 className="mb-6 text-2xl font-bold sm:text-3xl">
              Similar deals
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {similarDeals.map((similar) => {
                const sBrand = getBrandColor(similar.provider.slug);
                const sFrom = sBrand?.from ?? "#1a365d";
                const sTo = sBrand?.to ?? "#38a169";
                return (
                  <Link key={similar.id} href={`/deals/${similar.slug}`}>
                    <Card className="group h-full border border-border/60 transition-all hover:-translate-y-1 hover:shadow-xl">
                      <CardContent className="flex flex-col gap-3 p-5">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white",
                              getProviderColor(similar.provider.name)
                            )}
                          >
                            {getProviderInitials(similar.provider.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              {similar.provider.name}
                            </p>
                            <p className="truncate text-sm font-bold">
                              {similar.name.replace(/ - £[\d.]+\/mo.*/, "")}
                            </p>
                          </div>
                        </div>
                        <div className="mt-auto flex items-center justify-between border-t pt-3">
                          <div
                            className="rounded-md px-2.5 py-1 text-white text-sm font-bold tabular-nums shadow-sm"
                            style={{
                              background: `linear-gradient(135deg, ${sFrom}, ${sTo})`,
                            }}
                          >
                            £{similar.monthlyCost.toFixed(2)}
                            <span className="text-[10px] opacity-90 ml-0.5">
                              /mo
                            </span>
                          </div>
                          <ArrowRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

