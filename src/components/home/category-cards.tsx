import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { activeCategories, comingSoonCategories } from "@/config/categories";

export function CategoryCards() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="mb-12 text-center">
        <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Compare Real Deals
        </h2>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          We only show real prices from verified affiliate partners.
          No fake data, no made-up savings.
        </p>
      </div>

      {/* Active categories */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
        {activeCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Link key={category.slug} href={`/${category.slug}`}>
              <Card className="group h-full cursor-pointer border border-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5">
                <CardContent className="flex flex-col gap-3 sm:gap-4 p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${category.gradient} shadow-sm`}
                    >
                      <Icon className="size-6 text-white" />
                    </div>
                    <Badge className="bg-green-500 text-white text-[10px]">LIVE</Badge>
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-semibold text-foreground">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[#38a169]/10 px-3 py-2">
                    <p className="text-sm font-medium text-[#38a169]">
                      Average savings:{" "}
                      <span className="font-bold">{category.averageSavings}/yr</span>
                    </p>
                  </div>
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

      {/* Coming soon categories */}
      {comingSoonCategories.length > 0 && (
        <>
          <div className="mb-6 text-center">
            <h3 className="text-lg font-semibold text-muted-foreground">Coming Soon</h3>
            <p className="text-sm text-muted-foreground/70">
              We&apos;re working with providers to bring you real deals in these categories.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {comingSoonCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.slug} className="border border-dashed border-border/40 opacity-60">
                  <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                    <div
                      className={`flex size-10 items-center justify-center rounded-lg bg-gradient-to-br ${category.gradient} opacity-40`}
                    >
                      <Icon className="size-5 text-white" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">{category.name}</p>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                      <Clock className="size-3" />
                      Coming soon
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
