import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/shared/star-rating";
import { getProviders } from "@/lib/services/provider.service";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Our Providers",
  description:
    "Browse trusted providers across energy, broadband, mobile, insurance and finance. Read reviews, compare trust scores, and find the right provider for you.",
};

const FILTER_CATEGORIES = [
  "All",
  "Energy",
  "Broadband",
  "Mobile",
  "Insurance",
  "Finance",
] as const;

const providerColors = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-rose-500",
  "bg-cyan-500",
];

function getColorForName(name: string) {
  const index =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 6;
  return providerColors[index];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface ProvidersPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ProvidersPage({ searchParams }: ProvidersPageProps) {
  const params = await searchParams;
  const activeCategory = params.category || "All";
  const providers = await getProviders(
    activeCategory === "All" ? undefined : activeCategory.toLowerCase()
  );

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a365d] to-[#2a4a7f] py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Our Providers
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            We partner with the UK&apos;s leading providers to bring you the
            best deals across energy, broadband, mobile, insurance and
            finance.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Category Filter Tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {FILTER_CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={
                cat === "All"
                  ? "/providers"
                  : `/providers?category=${cat}`
              }
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-colors",
                activeCategory === cat
                  ? "bg-[#1a365d] text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Results count */}
        <p className="mb-6 text-sm text-muted-foreground">
          Showing {providers.length} provider{providers.length !== 1 && "s"}
          {activeCategory !== "All" && ` in ${activeCategory}`}
        </p>

        {/* Provider Grid */}
        {providers.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => (
              <Card
                key={provider.id}
                className="group border border-border/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <CardContent className="flex flex-col gap-4 p-6">
                  {/* Provider identity */}
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white",
                        getColorForName(provider.name)
                      )}
                    >
                      {getInitials(provider.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-semibold">
                        {provider.name}
                      </h3>
                      {provider.trustScore !== null && (
                        <StarRating
                          rating={provider.trustScore}
                          size={14}
                          showValue
                          reviewCount={provider.reviewCount}
                        />
                      )}
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-1.5">
                    {provider.categories.map((cat: string) => (
                      <Badge key={cat} variant="secondary" className="capitalize">
                        {cat}
                      </Badge>
                    ))}
                  </div>

                  {/* Plan count */}
                  <p className="text-sm text-muted-foreground">
                    {provider.planCount} plan
                    {provider.planCount !== 1 && "s"} available
                  </p>

                  {/* View provider link */}
                  <Link
                    href={`/providers/${provider.slug}`}
                    className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-[#1a365d] transition-colors hover:text-[#38a169] dark:text-blue-400 dark:hover:text-emerald-400"
                  >
                    View provider
                    <ExternalLink className="size-3.5" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed py-16 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              No providers found
              {activeCategory !== "All" && ` in ${activeCategory}`}.
            </p>
            <Link
              href="/providers"
              className="mt-2 inline-block text-sm text-[#1a365d] hover:underline"
            >
              View all providers
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
