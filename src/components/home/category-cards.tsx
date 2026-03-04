import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { categories } from "@/config/categories";

export function CategoryCards() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="mb-12 text-center">
        <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          What would you like to compare?
        </h2>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Choose a category below and start saving in minutes. We compare
          hundreds of deals from trusted UK providers.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Link key={category.slug} href={`/compare/${category.slug}`}>
              <Card className="group h-full cursor-pointer border border-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5">
                <CardContent className="flex flex-col gap-4 p-6">
                  {/* Icon */}
                  <div
                    className={`flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${category.gradient} shadow-sm`}
                  >
                    <Icon className="size-6 text-white" />
                  </div>

                  {/* Name & Description */}
                  <div>
                    <h3 className="mb-1 text-lg font-semibold text-foreground">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>

                  {/* Average savings */}
                  <div className="rounded-lg bg-[#38a169]/10 px-3 py-2">
                    <p className="text-sm font-medium text-[#38a169]">
                      Average savings:{" "}
                      <span className="font-bold">{category.averageSavings}/yr</span>
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-1 text-sm font-medium text-[#1a365d] transition-colors group-hover:text-[#38a169]">
                    <span>Compare now</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
