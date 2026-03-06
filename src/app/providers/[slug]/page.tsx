import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Globe, BarChart3, Layers, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "@/components/shared/star-rating";
import { PriceDisplay } from "@/components/shared/price-display";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { LocalBusinessJsonLd, BreadcrumbJsonLd } from "@/components/shared/json-ld";
import { getProviderBySlug, getAllProviderSlugs } from "@/lib/services/provider.service";
import { formatPrice } from "@/lib/constants";
import { siteConfig } from "@/config/seo";
import { getProviderColor, getProviderInitials } from "@/lib/utils/provider-avatar";
import { cn } from "@/lib/utils";

interface ProviderDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllProviderSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProviderDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const provider = await getProviderBySlug(slug);

  if (!provider) {
    return { title: "Provider Not Found" };
  }

  return {
    title: `${provider.name} - Plans, Reviews & Trust Score`,
    description: `Compare ${provider.name} plans and deals. Trust score: ${provider.trustScore ?? "N/A"}/5. Read ${provider.reviewCount} reviews from real customers.`,
    alternates: { canonical: `${siteConfig.url}/providers/${slug}` },
  };
}

export default async function ProviderDetailPage({
  params,
}: ProviderDetailPageProps) {
  const { slug } = await params;
  const provider = await getProviderBySlug(slug);

  if (!provider) {
    notFound();
  }

  const categories = provider.categories
    .split(",")
    .map((c: string) => c.trim());

  return (
    <div className="min-h-screen">
      <LocalBusinessJsonLd
        name={provider.name}
        description={provider.description ?? undefined}
        url={provider.website ?? undefined}
        trustScore={provider.trustScore}
        reviewCount={provider.reviewCount}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Providers", url: `${siteConfig.url}/providers` },
          { name: provider.name, url: `${siteConfig.url}/providers/${slug}` },
        ]}
      />

      {/* Provider Header */}
      <section className="bg-gradient-to-br from-[#1a365d] to-[#2a4a7f] py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Providers", href: "/providers" },
              { label: provider.name },
            ]}
            className="mb-4 [&_a]:text-blue-200 [&_a:hover]:text-white [&_span]:text-blue-200 [&_[aria-current]]:text-white [&_svg]:text-blue-300"
          />
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div
              className={cn(
                "flex size-20 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg",
                getProviderColor(provider.name)
              )}
            >
              {getProviderInitials(provider.name)}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {provider.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                {provider.trustScore !== null && (
                  <div className="flex items-center gap-2">
                    <StarRating
                      rating={provider.trustScore}
                      size={18}
                      showValue
                      reviewCount={provider.reviewCount}
                    />
                  </div>
                )}
                {provider.website && (
                  <a
                    href={provider.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-blue-200 transition-colors hover:text-white"
                  >
                    <Globe className="size-4" />
                    Visit website
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((cat: string) => (
                  <Badge
                    key={cat}
                    className="border-white/20 bg-white/10 capitalize text-white hover:bg-white/20"
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content with Tabs */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Tabs defaultValue="overview">
          <TabsList className="mb-8 w-full justify-start sm:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="plans">
              Plans ({provider._count.plans})
            </TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({provider._count.reviews})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Description */}
              <div className="lg:col-span-2">
                <h2 className="mb-4 text-2xl font-semibold">
                  About {provider.name}
                </h2>
                {provider.description ? (
                  <p className="leading-relaxed text-muted-foreground">
                    {provider.description}
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    {provider.name} is a trusted provider offering competitive
                    plans across{" "}
                    {categories.join(", ")}.
                  </p>
                )}
              </div>

              {/* Stats sidebar */}
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">
                      Provider Stats
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                          <BarChart3 className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Available Plans
                          </p>
                          <p className="text-lg font-semibold">
                            {provider._count.plans}
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                          <Layers className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Categories
                          </p>
                          <p className="text-lg font-semibold">
                            {categories.length}
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400">
                          <ShieldCheck className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Trust Score
                          </p>
                          <p className="text-lg font-semibold">
                            {provider.trustScore !== null
                              ? `${provider.trustScore.toFixed(1)} / 5.0`
                              : "Not rated"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans">
            {provider.plans.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {provider.plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className="group border border-border/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <CardContent className="flex flex-col gap-3 p-6">
                      <div>
                        <h3 className="text-base font-semibold">
                          {plan.name}
                        </h3>
                        {plan.category && (
                          <Badge variant="secondary" className="mt-1 capitalize">
                            {plan.category}
                          </Badge>
                        )}
                      </div>

                      {plan.description && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {plan.description}
                        </p>
                      )}

                      <div className="mt-auto border-t pt-3">
                        <PriceDisplay
                          amount={plan.monthlyCost}
                          period="month"
                          size="md"
                        />
                        {plan.annualCost !== null && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatPrice(plan.annualCost)}/year
                          </p>
                        )}
                        {plan.setupFee > 0 && (
                          <p className="text-xs text-muted-foreground">
                            + {formatPrice(plan.setupFee)} setup
                          </p>
                        )}
                      </div>

                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href={`/deals/${plan.slug}`}>
                          View deal
                          <ExternalLink className="ml-1 size-3.5" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed py-16 text-center">
                <p className="text-lg text-muted-foreground">
                  No plans currently available from {provider.name}.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            {provider.reviews.length > 0 ? (
              <div className="space-y-6">
                {provider.reviews.map((review) => (
                  <Card key={review.id} className="border border-border/60">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <StarRating
                            rating={review.rating}
                            size={16}
                            showValue={false}
                          />
                          {review.title && (
                            <h4 className="mt-2 text-base font-semibold">
                              {review.title}
                            </h4>
                          )}
                        </div>
                        {review.isVerified && (
                          <Badge
                            variant="outline"
                            className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
                          >
                            Verified
                          </Badge>
                        )}
                      </div>
                      {review.content && (
                        <p className="mt-3 leading-relaxed text-muted-foreground">
                          {review.content}
                        </p>
                      )}
                      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {review.user.name ?? "Anonymous"}
                        </span>
                        <span>&middot;</span>
                        <time>
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </time>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed py-16 text-center">
                <p className="text-lg text-muted-foreground">
                  No reviews yet for {provider.name}.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
