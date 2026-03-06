import type { Metadata } from "next";
import Link from "next/link";
import { Search, ExternalLink, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/shared/price-display";
import { StarRating } from "@/components/shared/star-rating";
import { getProviderColor, getProviderInitials } from "@/lib/utils/provider-avatar";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { SearchInput } from "./search-input";

export const metadata: Metadata = {
  title: "Search",
  description: "Search deals, providers, and guides on ValueSwitch.",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

async function searchAll(query: string) {
  if (!query || query.length < 2) return { deals: [], providers: [], guides: [] };

  const [deals, providers, guides] = await Promise.all([
    prisma.plan.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { category: { contains: query } },
        ],
      },
      include: { provider: { select: { name: true, slug: true } } },
      take: 12,
      orderBy: { monthlyCost: "asc" },
    }),
    prisma.provider.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
        ],
      },
      select: {
        id: true, name: true, slug: true, trustScore: true,
        reviewCount: true, categories: true, _count: { select: { plans: true } },
      },
      take: 6,
    }),
    prisma.guide.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { excerpt: { contains: query } },
          { category: { contains: query } },
        ],
      },
      select: { id: true, title: true, slug: true, category: true, excerpt: true, readTime: true },
      take: 6,
    }),
  ]);

  return { deals, providers, guides };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = await searchAll(query);
  const totalResults = results.deals.length + results.providers.length + results.guides.length;

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-[#1a365d] to-[#2a4a7f] py-12 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Search</h1>
          <p className="mt-2 text-blue-100">Find deals, providers, and guides</p>
          <div className="mx-auto mt-6 max-w-xl">
            <SearchInput defaultValue={query} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {query && (
          <p className="mb-6 text-sm text-muted-foreground">
            {totalResults} result{totalResults !== 1 && "s"} for &ldquo;{query}&rdquo;
          </p>
        )}

        {!query && (
          <div className="py-16 text-center">
            <Search className="mx-auto size-12 text-muted-foreground/40" />
            <p className="mt-4 text-lg text-muted-foreground">Enter a search term to find deals, providers, and guides.</p>
          </div>
        )}

        {query && totalResults === 0 && (
          <div className="py-16 text-center">
            <Search className="mx-auto size-12 text-muted-foreground/40" />
            <p className="mt-4 text-lg font-medium">No results found</p>
            <p className="mt-1 text-muted-foreground">Try different keywords or browse our categories.</p>
          </div>
        )}

        {/* Deals */}
        {results.deals.length > 0 && (
          <div className="mb-10">
            <h2 className="mb-4 text-xl font-semibold">Deals ({results.deals.length})</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.deals.map((deal) => (
                <Link key={deal.id} href={`/deals/${deal.slug}`}>
                  <Card className="group h-full border border-border/60 transition-all hover:-translate-y-0.5 hover:shadow-lg">
                    <CardContent className="flex flex-col gap-3 p-5">
                      <div className="flex items-center gap-2">
                        <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white", getProviderColor(deal.provider.name))}>
                          {getProviderInitials(deal.provider.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs text-muted-foreground">{deal.provider.name}</p>
                          <p className="truncate text-sm font-semibold">{deal.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize text-xs">{deal.category}</Badge>
                      </div>
                      <div className="mt-auto border-t pt-3">
                        <PriceDisplay amount={deal.monthlyCost} period="month" size="sm" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Providers */}
        {results.providers.length > 0 && (
          <div className="mb-10">
            <h2 className="mb-4 text-xl font-semibold">Providers ({results.providers.length})</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.providers.map((provider) => (
                <Link key={provider.id} href={`/providers/${provider.slug}`}>
                  <Card className="group h-full border border-border/60 transition-all hover:-translate-y-0.5 hover:shadow-lg">
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white", getProviderColor(provider.name))}>
                        {getProviderInitials(provider.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold">{provider.name}</p>
                        {provider.trustScore !== null && (
                          <StarRating rating={provider.trustScore} size={12} showValue reviewCount={provider.reviewCount} />
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">{provider._count.plans} plans</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Guides */}
        {results.guides.length > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-semibold">Guides ({results.guides.length})</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.guides.map((guide) => (
                <Link key={guide.id} href={`/guides/${guide.category}/${guide.slug}`}>
                  <Card className="group h-full border border-border/60 transition-all hover:-translate-y-0.5 hover:shadow-lg">
                    <CardContent className="flex flex-col gap-2 p-5">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize text-xs">{guide.category}</Badge>
                        {guide.readTime && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="size-3" />{guide.readTime} min
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold leading-snug group-hover:text-[#38a169]">{guide.title}</h3>
                      {guide.excerpt && (
                        <p className="line-clamp-2 text-xs text-muted-foreground">{guide.excerpt}</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
