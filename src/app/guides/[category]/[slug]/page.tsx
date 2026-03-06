import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Calendar, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ShareButtons } from "@/components/shared/share-buttons";
import { BreadcrumbJsonLd } from "@/components/shared/json-ld";
import { getGuideBySlug, getGuides, getAllGuideSlugs } from "@/lib/services/guide.service";
import { siteConfig } from "@/config/seo";

interface GuidePageProps {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateStaticParams() {
  const guides = await getAllGuideSlugs();
  return guides.map((g) => ({ category: g.category, slug: g.slug }));
}

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);

  if (!guide) {
    return { title: "Guide Not Found" };
  }

  const { category } = await params;
  return {
    title: guide.title,
    description:
      guide.excerpt ??
      `Read our comprehensive guide on ${guide.title}. Expert advice from ValueSwitch.`,
    alternates: { canonical: `${siteConfig.url}/guides/${category}/${slug}` },
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { category, slug } = await params;
  const guide = await getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  // Fetch related guides (same category, excluding current)
  const allCategoryGuides = await getGuides(guide.category);
  const relatedGuides = allCategoryGuides
    .filter((g) => g.id !== guide.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Guides", url: `${siteConfig.url}/guides` },
          { name: category.charAt(0).toUpperCase() + category.slice(1), url: `${siteConfig.url}/guides/${category}` },
          { name: guide.title, url: `${siteConfig.url}/guides/${category}/${slug}` },
        ]}
      />

      {/* Article Header */}
      <section className="bg-gradient-to-br from-[#1a365d] to-[#2a4a7f] py-12 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Guides", href: "/guides" },
              { label: category.charAt(0).toUpperCase() + category.slice(1), href: `/guides/${category}` },
              { label: guide.title },
            ]}
            className="mb-4 [&_a]:text-blue-200 [&_a:hover]:text-white [&_span]:text-blue-200 [&_[aria-current]]:text-white [&_svg]:text-blue-300"
          />
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {guide.title}
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-blue-200">
            {guide.author && (
              <span className="flex items-center gap-1.5">
                <User className="size-4" />
                {guide.author}
              </span>
            )}
            {guide.publishedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4" />
                {new Date(guide.publishedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
            {guide.readTime && (
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                {guide.readTime} min read
              </span>
            )}
            <Badge className="border-white/20 bg-white/10 capitalize text-white hover:bg-white/20">
              {guide.category}
            </Badge>
            <ShareButtons title={guide.title} url={`/guides/${category}/${slug}`} />
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="prose prose-lg max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h2:mt-10 prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-p:text-muted-foreground prose-a:text-[#1a365d] prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-ul:text-muted-foreground prose-ol:text-muted-foreground prose-li:marker:text-[#38a169] dark:prose-invert">
          <ReactMarkdown>{guide.content}</ReactMarkdown>
        </div>
      </article>

      {/* Related Guides */}
      {relatedGuides.length > 0 && (
        <section className="border-t bg-muted/30 py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-6 text-2xl font-semibold">Related Guides</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedGuides.map((related) => (
                <Link
                  key={related.id}
                  href={`/guides/${related.category}/${related.slug}`}
                >
                  <Card className="group h-full border border-border/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                    <CardContent className="flex h-full flex-col gap-3 p-5">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {related.category}
                        </Badge>
                        {related.readTime && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="size-3" />
                            {related.readTime} min read
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-semibold leading-snug transition-colors group-hover:text-[#38a169]">
                        {related.title}
                      </h3>
                      {related.excerpt && (
                        <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
                          {related.excerpt}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <Separator className="my-8" />
            <div className="text-center">
              <Link
                href={`/guides/${category}`}
                className="text-sm font-medium text-[#1a365d] hover:underline dark:text-blue-400"
              >
                View all {category} guides
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
