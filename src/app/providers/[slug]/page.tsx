import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ExternalLink,
  Globe,
  BarChart3,
  Layers,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Star,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "@/components/shared/star-rating";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import {
  LocalBusinessJsonLd,
  BreadcrumbJsonLd,
} from "@/components/shared/json-ld";
import { ReviewForm } from "@/components/shared/review-form";
import {
  getProviderBySlug,
  getAllProviderSlugs,
} from "@/lib/services/provider.service";
import { formatPrice } from "@/lib/constants";
import { siteConfig } from "@/config/seo";
import {
  getProviderColor,
  getProviderInitials,
} from "@/lib/utils/provider-avatar";
import { getBrandColor } from "@/config/brand-colors";
import { ProviderLogo } from "@/components/shared/provider-logo";
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

  const brand = getBrandColor(provider.slug);
  const heroFrom = brand?.from ?? "#1a365d";
  const heroTo = brand?.to ?? "#2a4a7f";

  const cheapest =
    provider.plans.length > 0
      ? Math.min(...provider.plans.map((p) => p.monthlyCost))
      : null;

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

      {/* Hero — brand-coloured gradient with animated decoration */}
      <section
        className="relative py-14 sm:py-20 text-white overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${heroFrom} 0%, ${heroTo} 60%, #0a1628 130%)`,
        }}
      >
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
              { label: "Providers", href: "/providers" },
              { label: provider.name },
            ]}
            className="mb-6 [&_a]:text-white/70 [&_a:hover]:text-white [&_span]:text-white/70 [&_[aria-current]]:text-white [&_svg]:text-white/60"
          />

          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div className="rounded-2xl bg-white/10 backdrop-blur p-3 ring-1 ring-white/20 shadow-2xl">
              <ProviderLogo
                name={provider.name}
                slug={provider.slug}
                logo={provider.logo}
                size={72}
              />
            </div>
            <div className="flex-1">
              <Badge className="mb-3 bg-white/15 text-white border-white/20 backdrop-blur-sm">
                <Sparkles className="size-3 mr-1" />
                Verified UK retailer
              </Badge>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                {provider.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                {provider.trustScore !== null && (
                  <div className="flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-3 py-1 ring-1 ring-white/20">
                    <Star className="size-4 fill-amber-300 text-amber-300" />
                    <span className="text-sm font-bold">
                      {provider.trustScore.toFixed(1)}/5
                    </span>
                    <span className="text-xs opacity-80">
                      ({provider.reviewCount} review
                      {provider.reviewCount !== 1 ? "s" : ""})
                    </span>
                  </div>
                )}
                {provider.website && (
                  <a
                    href={provider.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-white/90 hover:text-white transition-colors"
                  >
                    <Globe className="size-4" />
                    Visit website
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((cat: string) => (
                  <Badge
                    key={cat}
                    className="border-white/20 bg-white/10 capitalize text-white hover:bg-white/20 backdrop-blur-sm"
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live stats strip */}
      <section className="border-b bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900/40 dark:via-slate-900/20 dark:to-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
            {[
              {
                icon: BarChart3,
                value: provider._count.plans.toString(),
                label: "Live plans",
                grad: "from-blue-500 to-indigo-600",
              },
              {
                icon: Layers,
                value: categories.length.toString(),
                label: "Categories",
                grad: "from-emerald-500 to-teal-600",
              },
              {
                icon: ShieldCheck,
                value:
                  provider.trustScore !== null
                    ? provider.trustScore.toFixed(1)
                    : "—",
                label: "Trust score",
                grad: "from-amber-500 to-orange-600",
              },
              {
                icon: Sparkles,
                value: cheapest !== null ? `£${cheapest.toFixed(2)}` : "—",
                label: "Cheapest /mo",
                grad: "from-purple-500 to-fuchsia-600",
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

      {/* Content with Tabs */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
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
                <h2 className="mb-4 text-2xl font-bold">
                  About {provider.name}
                </h2>
                {provider.description ? (
                  <p className="leading-relaxed text-muted-foreground">
                    {provider.description}
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    {provider.name} is a trusted UK provider offering
                    competitive plans across {categories.join(", ")}.
                  </p>
                )}

                {/* Highlights */}
                <div className="mt-8 grid sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-border/50 p-5">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md mb-3">
                      <ShieldCheck className="size-5" />
                    </div>
                    <h3 className="font-bold mb-1">Awin verified</h3>
                    <p className="text-sm text-muted-foreground">
                      Real prices pulled directly from{" "}
                      {provider.name}&apos;s affiliate feed. No padding, no
                      fake savings.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-border/50 p-5">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md mb-3">
                      <Sparkles className="size-5" />
                    </div>
                    <h3 className="font-bold mb-1">Refreshed weekly</h3>
                    <p className="text-sm text-muted-foreground">
                      Our cron pulls{" "}
                      {provider.name}&apos;s feed every Sunday at 03:00 UTC so
                      you see the current monthly price.
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats sidebar */}
              <div className="space-y-4">
                <Card className="overflow-hidden border-0 shadow-lg">
                  <div
                    className="px-6 py-3 text-white"
                    style={{
                      background: `linear-gradient(90deg, ${heroFrom}, ${heroTo})`,
                    }}
                  >
                    <h3 className="text-sm font-bold uppercase tracking-wider">
                      Provider snapshot
                    </h3>
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                          <BarChart3 className="size-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                            Available plans
                          </p>
                          <p className="text-lg font-extrabold">
                            {provider._count.plans}
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
                          <Layers className="size-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                            Categories
                          </p>
                          <p className="text-lg font-extrabold">
                            {categories.length}
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
                          <ShieldCheck className="size-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                            Trust score
                          </p>
                          <p className="text-lg font-extrabold">
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
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {provider.plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className="group border border-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden"
                  >
                    <div
                      className="h-1"
                      style={{
                        background: `linear-gradient(90deg, ${heroFrom}, ${heroTo})`,
                      }}
                    />
                    <CardContent className="flex flex-col gap-3 p-6">
                      <div>
                        <h3 className="text-base font-bold leading-tight">
                          {plan.name.replace(/ - £[\d.]+\/mo.*/, "")}
                        </h3>
                        {plan.category && (
                          <Badge
                            variant="secondary"
                            className="mt-2 capitalize"
                          >
                            {plan.category}
                          </Badge>
                        )}
                      </div>

                      {plan.description && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {plan.description}
                        </p>
                      )}

                      <div className="mt-auto pt-3 border-t">
                        <div
                          className="rounded-lg px-3 py-2 text-white shadow-md inline-block"
                          style={{
                            background: `linear-gradient(135deg, ${heroFrom}, ${heroTo})`,
                          }}
                        >
                          <span className="text-xl font-extrabold tabular-nums">
                            £{plan.monthlyCost.toFixed(2)}
                          </span>
                          <span className="text-xs opacity-90 ml-0.5">
                            /mo
                          </span>
                        </div>
                        {plan.annualCost !== null && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            {formatPrice(plan.annualCost)}/year total
                          </p>
                        )}
                        {plan.setupFee > 0 && (
                          <p className="text-xs text-muted-foreground">
                            + {formatPrice(plan.setupFee)} setup
                          </p>
                        )}
                      </div>

                      <Button
                        asChild
                        size="sm"
                        className="w-full bg-gradient-to-r from-[#1a365d] to-[#38a169] hover:from-[#2a4a7f] hover:to-[#48bb78] text-white border-0 font-semibold shadow-md group-hover:shadow-lg"
                      >
                        <Link href={`/deals/${plan.slug}`}>
                          View deal
                          <ArrowRight className="ml-1 size-3.5" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed py-16 text-center">
                <p className="text-lg text-muted-foreground">
                  No plans currently available from {provider.name}.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <div className="mb-6">
              <ReviewForm
                providerSlug={provider.slug}
                providerName={provider.name}
              />
            </div>
            {provider.reviews.length > 0 ? (
              <div className="space-y-4">
                {provider.reviews.map((review) => {
                  const initials = (review.user.name || "U")
                    .split(/\s+/)
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  return (
                    <Card
                      key={review.id}
                      className="border border-border/60 hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              "flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-md",
                              getProviderColor(review.user.name || "User")
                            )}
                          >
                            {initials || getProviderInitials(provider.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <div>
                                <StarRating
                                  rating={review.rating}
                                  size={16}
                                  showValue={false}
                                />
                                {review.title && (
                                  <h4 className="mt-2 text-base font-bold">
                                    {review.title}
                                  </h4>
                                )}
                              </div>
                              {review.isVerified && (
                                <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white border-0 shadow-sm">
                                  <ShieldCheck className="size-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            {review.content && (
                              <p className="mt-3 leading-relaxed text-muted-foreground text-sm">
                                {review.content}
                              </p>
                            )}
                            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="font-bold text-foreground">
                                {review.user.name ?? "Anonymous"}
                              </span>
                              <span>·</span>
                              <time>
                                {new Date(
                                  review.createdAt
                                ).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </time>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed py-16 text-center">
                <Star className="size-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-lg font-semibold">
                  No reviews yet for {provider.name}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Be the first to share your experience.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
