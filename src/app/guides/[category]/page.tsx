import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Calendar, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getGuides } from "@/lib/services/guide.service";

interface CategoryGuidesPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({
  params,
}: CategoryGuidesPageProps): Promise<Metadata> {
  const { category } = await params;
  const formattedCategory =
    category.charAt(0).toUpperCase() + category.slice(1);

  return {
    title: `${formattedCategory} Guides & Advice`,
    description: `Expert guides and advice on ${formattedCategory.toLowerCase()}. Learn how to save money, compare deals, and switch providers with confidence.`,
  };
}

export default async function CategoryGuidesPage({
  params,
}: CategoryGuidesPageProps) {
  const { category } = await params;
  const formattedCategory =
    category.charAt(0).toUpperCase() + category.slice(1);
  const guides = await getGuides(category);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a365d] to-[#2a4a7f] py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/guides"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-blue-200 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" />
            All Guides
          </Link>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {formattedCategory} Guides
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            Everything you need to know about comparing and switching{" "}
            {formattedCategory.toLowerCase()} providers. Expert advice to help
            you save.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="mb-6 text-sm text-muted-foreground">
          {guides.length} guide{guides.length !== 1 && "s"} in{" "}
          {formattedCategory}
        </p>

        {guides.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <Link
                key={guide.id}
                href={`/guides/${category}/${guide.slug}`}
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
              No guides found in {formattedCategory}.
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
