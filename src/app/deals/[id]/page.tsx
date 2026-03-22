import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ExternalLink,
  TrendingUp,
  Star,
  Megaphone,
  Check,
  ArrowRight,
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

export async function generateMetadata({
  params,
}: DealDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const deal = await getDealBySlug(id);

  if (!deal) {
    return { title: "Deal Not Found" };
  }

  return {
    title: `${deal.provider.name} ${deal.name} - ${formatPrice(deal.monthlyCost)}/mo`,
    description: `${deal.provider.name} ${deal.name}: ${formatPrice(deal.monthlyCost)}/month. ${deal.description ?? `Compare this ${deal.category} deal and switch today.`}`,
    alternates: { canonical: `${siteConfig.url}/deals/${id}` },
  };
}

function renderSpecificationTable(deal: NonNullable<Awaited<ReturnType<typeof getDealBySlug>>>) {
  const specs: { label: string; value: string }[] = [];

  // Common fields
  if (deal.contractLength) {
    specs.push({
      label: "Contract Length",
      value: `${deal.contractLength} months`,
    });
  }
  if (deal.cancellationFee !== null && deal.cancellationFee !== undefined) {
    specs.push({
      label: "Cancellation Fee",
      value: formatPrice(deal.cancellationFee),
    });
  }

  // Category-specific fields
  switch (deal.category) {
    case "energy":
      if (deal.tariffType) specs.push({ label: "Tariff Type", value: deal.tariffType });
      if (deal.unitRate !== null) specs.push({ label: "Unit Rate", value: `${deal.unitRate}p/kWh` });
      if (deal.standingCharge !== null) specs.push({ label: "Standing Charge", value: `${deal.standingCharge}p/day` });
      if (deal.greenEnergy) specs.push({ label: "Green Energy", value: "Yes - 100% renewable" });
      break;
    case "broadband":
      if (deal.downloadSpeed !== null) specs.push({ label: "Download Speed", value: `${deal.downloadSpeed} Mbps` });
      if (deal.uploadSpeed !== null) specs.push({ label: "Upload Speed", value: `${deal.uploadSpeed} Mbps` });
      if (deal.dataLimit) specs.push({ label: "Data Limit", value: deal.dataLimit });
      else specs.push({ label: "Data Limit", value: "Unlimited" });
      if (deal.includesTV) specs.push({ label: "Includes TV", value: `Yes${deal.tvChannels ? ` (${deal.tvChannels} channels)` : ""}` });
      break;
    case "mobile":
      if (deal.dataAllowance) specs.push({ label: "Data Allowance", value: deal.dataAllowance });
      if (deal.minutes) specs.push({ label: "Minutes", value: deal.minutes });
      if (deal.texts) specs.push({ label: "Texts", value: deal.texts });
      if (deal.networkType) specs.push({ label: "Network", value: deal.networkType });
      if (deal.includesHandset && deal.handsetModel) specs.push({ label: "Handset", value: deal.handsetModel });
      break;
    case "insurance":
      if (deal.coverLevel) specs.push({ label: "Cover Level", value: deal.coverLevel });
      if (deal.excessAmount !== null) specs.push({ label: "Excess", value: formatPrice(deal.excessAmount ?? 0) });
      break;
    case "finance":
      if (deal.apr !== null) specs.push({ label: "APR", value: `${deal.apr}%` });
      if (deal.interestRate !== null) specs.push({ label: "Interest Rate", value: `${deal.interestRate}%` });
      if (deal.creditLimit !== null) specs.push({ label: "Credit Limit", value: formatPrice(deal.creditLimit) });
      if (deal.introRate !== null && deal.introRatePeriod !== null) {
        specs.push({ label: "Introductory Rate", value: `${deal.introRate}% for ${deal.introRatePeriod} months` });
      }
      if (deal.balanceTransfer) specs.push({ label: "Balance Transfer", value: "Available" });
      break;
  }

  return specs;
}

export default async function DealDetailPage({ params }: DealDetailPageProps) {
  const { id } = await params;
  const deal = await getDealBySlug(id);

  if (!deal) {
    notFound();
  }

  const similarDeals = await getSimilarDeals(deal.id, deal.category, 4);
  const specifications = renderSpecificationTable(deal);

  // Parse features
  let features: string[] = [];
  if (deal.features) {
    try {
      features = JSON.parse(deal.features);
    } catch {
      features = deal.features.split(",").map((f: string) => f.trim());
    }
  }

  const dealUrl = `/deals/${id}`;

  return (
    <div className="min-h-screen">
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
          { name: deal.provider.name, url: `${siteConfig.url}/providers/${deal.provider.slug}` },
          { name: deal.name, url: `${siteConfig.url}${dealUrl}` },
        ]}
      />

      {/* Deal Header */}
      <section className="bg-gradient-to-br from-[#1a365d] to-[#2a4a7f] py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: deal.provider.name, href: `/providers/${deal.provider.slug}` },
              { label: deal.name },
            ]}
            className="mb-4 [&_a]:text-blue-200 [&_a:hover]:text-white [&_span]:text-blue-200 [&_[aria-current]]:text-white [&_svg]:text-blue-300"
          />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-200">
                {deal.provider.name}
              </p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {deal.name}
              </h1>
              <div className="mt-3 flex flex-wrap gap-2">
                {deal.isBestValue && (
                  <Badge className="bg-[#38a169] text-white hover:bg-[#38a169]">
                    <TrendingUp className="mr-1 size-3" />
                    Best Value
                  </Badge>
                )}
                {deal.isPopular && (
                  <Badge className="bg-orange-500 text-white hover:bg-orange-500">
                    <Star className="mr-1 size-3" />
                    Popular
                  </Badge>
                )}
                {deal.isPromoted && (
                  <Badge className="bg-[#1a365d] text-white hover:bg-[#1a365d]">
                    <Megaphone className="mr-1 size-3" />
                    Promoted
                  </Badge>
                )}
                <Badge className="border-white/20 bg-white/10 capitalize text-white hover:bg-white/20">
                  {deal.category}
                </Badge>
              </div>
            </div>
            <ShareButtons title={`${deal.provider.name} ${deal.name}`} url={dealUrl} />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left column - details */}
          <div className="space-y-8 lg:col-span-2">
            {/* Price Hero Card */}
            <Card className="border-2 border-[#38a169]/20">
              <CardContent className="p-8">
                <div className="grid gap-6 sm:grid-cols-3">
                  <div className="text-center">
                    <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                      Monthly Cost
                    </p>
                    <div className="mt-2 flex items-baseline justify-center gap-1">
                      <span className="text-lg font-medium text-muted-foreground">
                        &pound;
                      </span>
                      <span className="text-5xl font-bold text-foreground">
                        {deal.monthlyCost.toFixed(2)}
                      </span>
                      <span className="text-lg text-muted-foreground">
                        /mo
                      </span>
                    </div>
                  </div>
                  {deal.annualCost !== null && (
                    <div className="text-center">
                      <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                        Annual Cost
                      </p>
                      <p className="mt-2 text-3xl font-bold">
                        {formatPrice(deal.annualCost)}
                      </p>
                      <p className="text-sm text-muted-foreground">/year</p>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                      Setup Fee
                    </p>
                    <p className="mt-2 text-3xl font-bold">
                      {deal.setupFee > 0
                        ? formatPrice(deal.setupFee)
                        : "Free"}
                    </p>
                    {deal.setupFee === 0 && (
                      <p className="text-sm text-emerald-600">No setup cost</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            {specifications.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-semibold">Specifications</h2>
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {specifications.map((spec, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4"
                        >
                          <span className="text-sm text-muted-foreground">
                            {spec.label}
                          </span>
                          <span className="text-sm font-medium">
                            {spec.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Features */}
            {features.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-semibold">Features</h2>
                <Card>
                  <CardContent className="p-6">
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2.5"
                        >
                          <Check className="mt-0.5 size-4 shrink-0 text-[#38a169]" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Description */}
            {deal.description && (
              <div>
                <h2 className="mb-4 text-xl font-semibold">About This Deal</h2>
                <p className="leading-relaxed text-muted-foreground">
                  {deal.description}
                </p>
              </div>
            )}
          </div>

          {/* Right column - sidebar */}
          <div className="space-y-6">
            {/* CTA Card */}
            <Card className="sticky top-20 border-2 border-[#38a169]/30">
              <CardContent className="p-6">
                <PriceDisplay
                  amount={deal.monthlyCost}
                  period="month"
                  size="lg"
                />
                {deal.annualCost !== null && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatPrice(deal.annualCost)}/year
                  </p>
                )}
                <Separator className="my-4" />
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-[#1a365d] to-[#38a169] text-white hover:from-[#2a4a7f] hover:to-[#48bb78]"
                  size="lg"
                >
                  <a
                    href={deal.affiliateUrl ?? `/api/redirect?plan=${deal.id}`}
                    target="_blank"
                    rel="noopener noreferrer nofollow sponsored"
                  >
                    Go to {deal.provider.name}
                    <ExternalLink className="ml-2 size-4" />
                  </a>
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  You&apos;ll be taken to {deal.provider.name}&apos;s website to
                  complete your switch.
                </p>
              </CardContent>
            </Card>

            {/* Provider Info Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-base font-semibold">
                  About {deal.provider.name}
                </h3>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
                      getProviderColor(deal.provider.name)
                    )}
                  >
                    {getProviderInitials(deal.provider.name)}
                  </div>
                  <div>
                    <p className="font-medium">{deal.provider.name}</p>
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
                <Separator className="my-4" />
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
        <section className="border-t bg-muted/30 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-6 text-2xl font-semibold">Similar Deals</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {similarDeals.map((similar) => (
                <Card
                  key={similar.id}
                  className="group border border-border/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <CardContent className="flex flex-col gap-3 p-5">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                          getProviderColor(similar.provider.name)
                        )}
                      >
                        {getProviderInitials(similar.provider.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs text-muted-foreground">
                          {similar.provider.name}
                        </p>
                        <p className="truncate text-sm font-semibold">
                          {similar.name}
                        </p>
                      </div>
                    </div>
                    <div className="mt-auto border-t pt-3">
                      <PriceDisplay
                        amount={similar.monthlyCost}
                        period="month"
                        size="sm"
                      />
                    </div>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href={`/deals/${similar.slug}`}>
                        View deal
                        <ArrowRight className="ml-1 size-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
