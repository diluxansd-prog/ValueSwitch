"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Zap,
  SlidersHorizontal,
  ArrowUpDown,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ComparisonCard } from "@/components/comparison/comparison-card";
import {
  ComparisonFilters,
  type FilterValues,
} from "@/components/comparison/comparison-filters";
import type { PlanWithProvider, ComparisonResult } from "@/types/comparison";
import { ITEMS_PER_PAGE } from "@/lib/constants";

function EnergyCompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const postcode = searchParams.get("postcode") || "";
  const subcategory = searchParams.get("subcategory") || "";
  const initialSort = searchParams.get("sort") || "price";
  const initialPage = Number(searchParams.get("page")) || 1;

  const [results, setResults] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState(initialSort);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(initialPage);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<FilterValues>({});
  const [providers, setProviders] = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        category: "energy",
        ...(subcategory && { subcategory }),
        ...(postcode && { postcode }),
        sortBy,
        sortOrder,
        page: String(page),
        perPage: String(ITEMS_PER_PAGE),
      });

      // Add filters
      if (filters.minPrice) queryParams.set("minPrice", String(filters.minPrice));
      if (filters.maxPrice) queryParams.set("maxPrice", String(filters.maxPrice));
      if (filters.greenOnly) queryParams.set("greenOnly", "true");
      if (filters.tariffType) queryParams.set("tariffType", filters.tariffType);
      if (filters.providers && filters.providers.length > 0) {
        queryParams.set("providers", filters.providers.join(","));
      }

      const res = await fetch(`/api/comparison?${queryParams.toString()}`);
      if (res.ok) {
        const data: ComparisonResult = await res.json();
        setResults(data);

        // Extract unique providers
        const uniqueProviders = [
          ...new Set(data.plans.map((p) => p.provider.name)),
        ];
        if (uniqueProviders.length > 0 && providers.length === 0) {
          setProviders(uniqueProviders);
        }
      }
    } catch (error) {
      console.error("Failed to fetch comparison results:", error);
    } finally {
      setLoading(false);
    }
  }, [subcategory, postcode, sortBy, sortOrder, page, filters, providers.length]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  function handleSortChange(value: string) {
    setSortBy(value);
    setPage(1);
  }

  function handleFiltersChange(newFilters: FilterValues) {
    setFilters(newFilters);
    setPage(1);
    setMobileFiltersOpen(false);
  }

  const totalPages = results
    ? Math.ceil(results.totalCount / ITEMS_PER_PAGE)
    : 0;

  return (
    <div>
      {/* Header */}
      <section className="border-b bg-gradient-to-r from-yellow-500 to-orange-500">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
            <Link href="/energy" className="hover:text-white transition-colors">
              Energy
            </Link>
            <ChevronRight className="size-3" />
            <span>Compare</span>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold text-white sm:text-3xl">
                <Zap className="size-7" />
                Compare Energy Deals
              </h1>
              {postcode && (
                <p className="mt-1 text-sm text-white/80">
                  Showing deals for {postcode}
                </p>
              )}
            </div>
            {results && (
              <div className="text-sm font-medium text-white/90">
                {results.totalCount} deals found
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Controls Bar */}
      <section className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 sm:gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile filter trigger */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal className="size-4" />
                  <span className="hidden sm:inline ml-2">Filters</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[min(320px,85vw)] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filter Results</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <ComparisonFilters
                    category="energy"
                    onFiltersChange={handleFiltersChange}
                    providers={providers}
                  />
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="hidden sm:block size-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="h-9 w-[110px] sm:w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="popularity">Popularity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setSortOrder((o) => (o === "asc" ? "desc" : "asc"))
              }
              className="text-xs hidden sm:inline-flex"
            >
              {sortOrder === "asc" ? "Low to High" : "High to Low"}
            </Button>
          </div>

          <div className="hidden sm:flex items-center gap-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="size-10 sm:size-9"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="size-10 sm:size-9"
              onClick={() => setViewMode("list")}
            >
              <List className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-slate-50 dark:bg-slate-900/30">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden w-64 shrink-0 lg:block">
              <div className="sticky top-20 rounded-xl border bg-background p-5">
                <ComparisonFilters
                  category="energy"
                  onFiltersChange={handleFiltersChange}
                  providers={providers}
                />
              </div>
            </aside>

            {/* Results */}
            <div className="min-w-0 flex-1">
              {loading ? (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 gap-6 md:grid-cols-2"
                      : "flex flex-col gap-4"
                  }
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-xl border bg-background p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <Skeleton className="size-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-5 w-40" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <Skeleton className="h-12 rounded-lg" />
                        <Skeleton className="h-12 rounded-lg" />
                        <Skeleton className="h-12 rounded-lg" />
                      </div>
                      <Skeleton className="h-px w-full mb-4" />
                      <div className="flex justify-between items-end">
                        <Skeleton className="h-10 w-28" />
                        <Skeleton className="h-10 w-24 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : results && results.plans.length > 0 ? (
                <>
                  {/* Results count */}
                  <p className="mb-6 text-sm text-muted-foreground">
                    Showing{" "}
                    {Math.min(
                      (page - 1) * ITEMS_PER_PAGE + 1,
                      results.totalCount
                    )}
                    -
                    {Math.min(page * ITEMS_PER_PAGE, results.totalCount)} of{" "}
                    {results.totalCount} energy deals
                  </p>

                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 gap-6 md:grid-cols-2"
                        : "flex flex-col gap-4"
                    }
                  >
                    {results.plans.map((plan: PlanWithProvider) => (
                      <ComparisonCard key={plan.id} plan={plan} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-10 flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        <ChevronLeft className="mr-1 size-4" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 5) }).map(
                          (_, i) => {
                            const pageNum = i + 1;
                            return (
                              <Button
                                key={pageNum}
                                variant={
                                  page === pageNum ? "default" : "outline"
                                }
                                size="sm"
                                className="size-10 sm:size-9"
                                onClick={() => setPage(pageNum)}
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                        )}
                        {totalPages > 5 && (
                          <>
                            <span className="px-1 text-muted-foreground">
                              ...
                            </span>
                            <Button
                              variant={
                                page === totalPages ? "default" : "outline"
                              }
                              size="sm"
                              className="size-9"
                              onClick={() => setPage(totalPages)}
                            >
                              {totalPages}
                            </Button>
                          </>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        Next
                        <ChevronRight className="ml-1 size-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border bg-background p-12 text-center">
                  <Zap className="mb-4 size-12 text-muted-foreground/50" />
                  <h3 className="mb-2 text-lg font-semibold">
                    No energy deals found
                  </h3>
                  <p className="mb-6 max-w-md text-sm text-muted-foreground">
                    We couldn&apos;t find any energy deals matching your
                    criteria. Try adjusting your filters or broadening your
                    search.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => handleFiltersChange({})}
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function EnergyComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a365d]" /></div>}>
      <EnergyCompareContent />
    </Suspense>
  );
}
