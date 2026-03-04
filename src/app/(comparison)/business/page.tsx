import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  Zap,
  Wifi,
  PiggyBank,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Users,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCategoryBySlug } from "@/config/categories";

export const metadata: Metadata = {
  title: "Compare Business Services",
  description:
    "Compare business energy, broadband and finance deals. Save on your business overheads with ValueSwitch.",
};

const subcategoryIcons: Record<string, typeof Zap> = {
  energy: Zap,
  broadband: Wifi,
  finance: PiggyBank,
};

export default async function BusinessPage() {
  const category = getCategoryBySlug("business")!;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)",
            }}
          />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <Building2 className="size-4" />
              Average savings of {category.averageSavings}/year for SMEs
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {category.heroTitle}
            </h1>
            <p className="mb-8 max-w-2xl text-lg leading-relaxed text-white/90">
              {category.heroDescription}
            </p>
            <Button
              asChild
              size="lg"
              className="bg-white text-slate-700 hover:bg-white/90 shadow-lg"
            >
              <Link href="/business/energy">
                Get started
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0 60V30C240 10 480 0 720 10C960 20 1200 40 1440 30V60H0Z"
              className="fill-background"
            />
          </svg>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 px-4 py-6 sm:px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-5 text-[#38a169]" />
            <span>Trusted by 10,000+ UK businesses</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingDown className="size-5 text-[#38a169]" />
            <span>Save on your business overheads</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="size-5 text-[#38a169]" />
            <span>Dedicated business support team</span>
          </div>
        </div>
      </section>

      {/* Subcategory Cards */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground">
              Business Comparison Services
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Whether you&apos;re a sole trader or a large enterprise, we can
              help you find the best deals tailored to your business needs.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {category.subcategories.map((sub) => {
              const Icon = subcategoryIcons[sub.slug] || Building2;
              return (
                <Link key={sub.slug} href={`/business/${sub.slug}`}>
                  <Card className="group h-full border border-border/60 transition-all duration-200 hover:border-slate-500/30 hover:shadow-lg hover:-translate-y-1">
                    <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                      <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-500/10 to-slate-600/10 transition-all group-hover:from-slate-500/20 group-hover:to-slate-600/20">
                        <Icon className="size-8 text-slate-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-slate-700">
                        {sub.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {sub.description}
                      </p>
                      <span className="flex items-center text-sm font-medium text-slate-600">
                        Compare now
                        <ArrowRight className="ml-1 size-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="bg-slate-50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground">
              Why Businesses Choose ValueSwitch
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#1a365d]/10">
                <Clock className="size-7 text-[#1a365d]" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Save Time</h3>
              <p className="text-sm text-muted-foreground">
                Compare multiple business suppliers in one place. No need to
                contact each provider individually.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#38a169]/10">
                <TrendingDown className="size-7 text-[#38a169]" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Reduce Costs</h3>
              <p className="text-sm text-muted-foreground">
                Our business customers save an average of {category.averageSavings}{" "}
                per year on their overheads.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-purple-500/10">
                <Users className="size-7 text-purple-500" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Expert Support</h3>
              <p className="text-sm text-muted-foreground">
                Our dedicated business team is available to help you find the
                right deals for your company.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
