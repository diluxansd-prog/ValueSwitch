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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PriceDisplay } from "@/components/shared/price-display";
import { StarRating } from "@/components/shared/star-rating";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ShareButtons } from "@/components/shared/share-buttons";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/shared/json-ld";
import { getDealBySlug, getSimilarDeals, getAllDealSlugs } from "@/lib/services/deal.service";
import { formatPrice } from "@/lib/constants";
import { siteConfig } from "@/config/seo";
import { getProviderColor, getProviderInitials } from "@/lib/utils/provider-avatar";
import { cn } from "@/lib/utils";

interface DealDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllDealSlugs();
  return slugs.map((slug) => ({ id: slug }));
}

export async function generateMetadata({ params }: DealDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const deal = await getDealBySlug(id);
  if (!deal) return { title: "Deal Not Found" };
  return {
    title: `${deal.provider.name} ${deal.name} - ${formatPrice(deal.monthlyCost)}/mo`,
    description: `${deal.provider.name} ${deal.name}: ${formatPrice(deal.monthlyCost)}/month. ${deal.description ?? `Compare this ${deal.category} deal and switch today.`}`,
    alternates: { canonical: `${siteConfig.url}/deals/${id}` },
  };
}

export default async function DealDetailPage({ params }: DealDetailPageProps) {
  const { id } = await params;
  const deal = await getDealBySlug(id);
  if (!deal) notFound();

  const similarDeals = await getSimilarDeals(deal.id, deal.category, 4);

  let features: string[] = [];
  if (deal.features) {
    try { features = JSON.parse(deal.features); } catch { features = deal.features.split(",").map((f: string) => f.trim()); }
  }

  const dealUrl = `/deals/${id}`;

  // Quick stat cards for mobile deals
  const quickStats = [
    { icon: HardDrive, label: "Data", value: deal.dataAllowance || "—", color: "text-blue-500 bg-blue-50 dark:bg-blue-950" },
    { icon: Signal, label: "Minutes", value: deal.minutes || "—", color: "text-green-500 bg-green-50 dark:bg-green-950" },
    { icon: MessageSquare, label: "Texts", value: deal.texts || "—", color: "text-purple-500 bg-purple-50 dark:bg-purple-950" },
    { icon: Wifi, label: "Network", value: deal.networkType || "—", color: "text-orange-500 bg-orange-50 dark:bg-orange-950" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      <ProductJsonLd name={`${deal.provider.name} ${deal.name}`} description={deal.description ?? undefined} provider={deal.provider.name} price={deal.monthlyCost} category={deal.category} url={`${siteConfig.url}${dealUrl}`} />
      <BreadcrumbJsonLd items={[{ name: "Home", url: siteConfig.url }, { name: deal.provider.name, url: `${siteConfig.url}/providers/${deal.provider.slug}` }, { name: deal.name, url: `${siteConfig.url}${dealUrl}` }]} />

      {/* Hero Header */}
      <section className="relative bg-gradient-to-br from-[#1a365d] via-[#1e3a5f] to-[#2a4a7f] pb-24 pt-8 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Mobile", href: "/mobile" }, { label: deal.provider.name, href: `/providers/${deal.provider.slug}` }, { label: "Deal" }]}
            className="mb-6 [&_a]:text-blue-200 [&_a:hover]:text-white [&_span]:text-blue-200 [&_[aria-current]]:text-white [&_svg]:text-blue-300"
          />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn("flex size-12 items-center justify-center rounded-xl text-sm font-bold text-white", getProviderColor(deal.provider.name))}>
                  {getProviderInitials(deal.provider.name)}
                </div>
                <div>
                  <p className="text-sm text-blue-200">{deal.provider.name}</p>
                  {deal.provider.trustScore !== null && (
                    <StarRating rating={deal.provider.trustScore} size={12} showValue reviewCount={deal.provider.reviewCount} />
                  )}
                </div>
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                {deal.name}
              </h1>
              <div className="mt-4 flex flex-wrap gap-2">
                {deal.isBestValue && <Badge className="bg-emerald-500 text-white"><TrendingUp className="mr-1 size-3" />Best Value</Badge>}
                {deal.isPopular && <Badge className="bg-amber-500 text-white"><Star className="mr-1 size-3" />Popular</Badge>}
                {deal.includesHandset && deal.handsetModel && <Badge className="bg-white/15 text-white backdrop-blur-sm"><Smartphone className="mr-1 size-3" />{deal.handsetModel}</Badge>}
                {deal.networkType && <Badge className="bg-white/15 text-white backdrop-blur-sm"><Wifi className="mr-1 size-3" />{deal.networkType}</Badge>}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {deal.imageUrl && (
                <div className="hidden sm:block relative size-28 lg:size-36 bg-white/10 rounded-2xl p-2 backdrop-blur-sm">
                  <Image
                    src={deal.imageUrl}
                    alt={deal.name}
                    fill
                    className="object-contain p-2"
                    sizes="144px"
                  />
                </div>
              )}
              <ShareButtons title={`${deal.provider.name} ${deal.name}`} url={dealUrl} />
            </div>
          </div>
        </div>
      </section>

      {/* Floating Price Card + Content */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Left: Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Price Hero Card */}
            <Card className="shadow-xl border-0">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Monthly cost</p>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-2xl font-semibold text-muted-foreground">£</span>
                      <span className="text-5xl font-extrabold tracking-tight">{deal.monthlyCost.toFixed(2)}</span>
                      <span className="text-lg text-muted-foreground">/mo</span>
                    </div>
                    {deal.annualCost !== null && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Total cost: <span className="font-semibold text-foreground">{formatPrice(deal.annualCost)}</span>
                        {deal.contractLength && <span> over {deal.contractLength} months</span>}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-3 sm:items-end">
                    {deal.setupFee > 0 ? (
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="size-4 text-muted-foreground" />
                        <span>Upfront: <span className="font-semibold">{formatPrice(deal.setupFee)}</span></span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-emerald-600">
                        <Check className="size-4" />
                        <span className="font-medium">No upfront cost</span>
                      </div>
                    )}
                    {deal.contractLength && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="size-4 text-muted-foreground" />
                        <span>{deal.contractLength}-month contract</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickStats.map((stat) => (
                <Card key={stat.label} className="border-0 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <div className={cn("mx-auto mb-2 flex size-10 items-center justify-center rounded-xl", stat.color)}>
                      <stat.icon className="size-5" />
                    </div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-sm font-bold mt-0.5">{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Features */}
            {features.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Shield className="size-5 text-[#38a169]" />
                    What&apos;s included
                  </h2>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950">
                          <Check className="size-3 text-emerald-500" />
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
                  <h2 className="text-lg font-semibold mb-3">About this deal</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">{deal.description}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Sticky Sidebar */}
          <div className="space-y-4">
            <Card className="sticky top-20 shadow-xl border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-[#1a365d] to-[#38a169] p-4 text-center text-white">
                <p className="text-xs font-medium uppercase tracking-wider opacity-80">Best price</p>
                <div className="flex items-baseline justify-center gap-0.5 mt-1">
                  <span className="text-lg">£</span>
                  <span className="text-4xl font-extrabold">{deal.monthlyCost.toFixed(2)}</span>
                  <span className="text-sm opacity-80">/mo</span>
                </div>
              </div>
              <CardContent className="p-5 space-y-4">
                <Button asChild className="w-full h-12 text-base bg-gradient-to-r from-[#38a169] to-[#48bb78] text-white hover:from-[#2f8a5a] hover:to-[#38a169] shadow-lg shadow-green-500/20" size="lg">
                  <a href={deal.affiliateUrl ?? `/api/redirect?plan=${deal.id}`} target="_blank" rel="noopener noreferrer nofollow sponsored">
                    Go to {deal.provider.name}
                    <ExternalLink className="ml-2 size-4" />
                  </a>
                </Button>
                <p className="text-center text-[11px] text-muted-foreground">
                  You&apos;ll be taken to {deal.provider.name}&apos;s website.
                  We may earn a commission.
                </p>
                <Separator />
                {/* Provider mini card */}
                <div className="flex items-center gap-3">
                  <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white", getProviderColor(deal.provider.name))}>
                    {getProviderInitials(deal.provider.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{deal.provider.name}</p>
                    {deal.provider.trustScore !== null && (
                      <StarRating rating={deal.provider.trustScore} size={11} showValue reviewCount={deal.provider.reviewCount} />
                    )}
                  </div>
                </div>
                <Button asChild variant="outline" size="sm" className="w-full">
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
        <section className="mt-16 border-t bg-white dark:bg-background py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-6 text-2xl font-bold">Similar Deals</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {similarDeals.map((similar) => (
                <Link key={similar.id} href={`/deals/${similar.slug}`}>
                  <Card className="group h-full border border-border/60 transition-all hover:-translate-y-0.5 hover:shadow-lg">
                    <CardContent className="flex flex-col gap-3 p-5">
                      <div className="flex items-center gap-2">
                        <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white", getProviderColor(similar.provider.name))}>
                          {getProviderInitials(similar.provider.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs text-muted-foreground">{similar.provider.name}</p>
                          <p className="truncate text-sm font-semibold group-hover:text-[#38a169]">{similar.name}</p>
                        </div>
                      </div>
                      <div className="mt-auto flex items-center justify-between border-t pt-3">
                        <PriceDisplay amount={similar.monthlyCost} period="month" size="sm" />
                        <ArrowRight className="size-4 text-muted-foreground group-hover:text-[#38a169] transition-transform group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
