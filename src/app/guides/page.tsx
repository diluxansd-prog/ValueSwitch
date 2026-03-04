import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getGuides } from "@/lib/services/guide.service";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Guides & Advice",
  description:
    "Expert guides and advice on saving money across energy, broadband, mobile, insurance and finance. Learn how to get the best deals and switch with confidence.",
};

const FILTER_CATEGORIES = [
  "All",
  "Energy",
  "Broadband",
  "Mobile",
  "Insurance",
  "Finance",
] as const;

interface GuidesPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function GuidesPage({ searchParams }: GuidesPageProps) {
  const params = await searchParams;
  const activeCategory = params.category || "All";
  const guides = await getGuides(
    activeCategory === "All" ? undefined : activeCategory.toLowerCase()
  );

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a365d] to-[#2a4a7f] py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Guides &amp; Advice
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            Expert tips and in-depth guides to help you save money and make
            informed switching decisions across all categories.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {FILTER_CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={
                cat === "All"
                  ? "/guides"
                  : `/guides?category=${cat}`
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
          {guides.length} guide{guides.length !== 1 && "s"} available
          {activeCategory !== "All" && ` in ${activeCategory}`}
        </p>

        {/* Guides Grid */}
        {guides.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <Link
                key={guide.id}
                href={`/guides/${guide.category}/${guide.slug}`}
              >
                <Card className="group h-full border border-border/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                  <CardContent className="flex h-full flex-col gap-3 p-6">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {guide.category}
                      </Badge>
                      {guide.readTime && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          {guide.readTime} min read
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold leading-snug transition-colors group-hover:text-[#38a169]">
                      {guide.title}
                    </h3>

                    {guide.excerpt && (
                      <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {guide.excerpt}
                      </p>
                    )}

                    {guide.publishedAt && (
                      <div className="mt-auto flex items-center gap-1.5 pt-2 text-xs text-muted-foreground">
                        <Calendar className="size-3" />
                        {new Date(guide.publishedAt).toLocaleDateString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed py-16 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              No guides found
              {activeCategory !== "All" && ` in ${activeCategory}`}.
            </p>
            <Link
              href="/guides"
              className="mt-2 inline-block text-sm text-[#1a365d] hover:underline"
            >
              View all guides
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
