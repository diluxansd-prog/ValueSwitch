import type { Metadata } from "next";
import Link from "next/link";
import {
  PiggyBank,
  CreditCard,
  Banknote,
  Home,
  Wallet,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCategoryBySlug } from "@/config/categories";
import { getPopularDeals } from "@/lib/services/deal.service";
import { formatPrice } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Compare Financial Products",
  description:
    "Compare credit cards, loans, mortgages and savings accounts. Find the best financial products for your needs.",
};

const subcategoryIcons: Record<string, typeof CreditCard> = {
  "credit-cards": CreditCard,
  loans: Banknote,
  mortgages: Home,
  savings: Wallet,
};

export default async function FinancePage() {
  const category = getCategoryBySlug("finance")!;
  const deals = await getPopularDeals("finance", 6);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-500">
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
              <PiggyBank className="size-4" />
              Average savings of {category.averageSavings}/year
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
              className="bg-white text-emerald-600 hover:bg-white/90 shadow-lg"
            >
              <Link href="/finance/credit-cards">
                Start comparing
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
            <span>FCA Authorised</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingDown className="size-5 text-[#38a169]" />
            <span>Impartial comparison</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-5 text-[#38a169]" />
            <span>No impact on your credit score</span>
          </div>
        </div>
      </section>

      {/* Subcategory Cards */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground">
              What are you looking for?
            </h2>
            <p className="text-muted-foreground">
              Choose a category to find the best financial products.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {category.subcategories.map((sub) => {
              const Icon = subcategoryIcons[sub.slug] || PiggyBank;
              return (
                <Link key={sub.slug} href={`/finance/${sub.slug}`}>
                  <Card className="group h-full border border-border/60 transition-all duration-200 hover:border-emerald-500/30 hover:shadow-lg hover:-translate-y-1">
                    <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                      <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 transition-all group-hover:from-emerald-500/20 group-hover:to-teal-500/20">
                        <Icon className="size-8 text-emerald-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-emerald-600">
                        {sub.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {sub.description}
                      </p>
                      <span className="flex items-center text-sm font-medium text-emerald-600">
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

      {/* Popular Finance Deals */}
      <section className="bg-slate-50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground">
              Popular Financial Products
            </h2>
            <p className="text-muted-foreground">
              Featured financial products from trusted UK providers.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal: any) => (
              <Card
                key={deal.id}
                className="group relative border border-border/60 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                {(deal.isPromoted || deal.isBestValue) && (
                  <div className="absolute -top-0 left-4">
                    <Badge
                      className={`rounded-t-none rounded-b-md text-white hover:text-white ${
                        deal.isBestValue
                          ? "bg-[#38a169] hover:bg-[#38a169]"
                          : "bg-[#1a365d] hover:bg-[#1a365d]"
                      }`}
                    >
                      {deal.isBestValue ? "Best Value" : "Promoted"}
                    </Badge>
                  </div>
                )}
                <CardContent className="flex flex-col gap-4 p-6 pt-8">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {deal.provider.name}
                    </p>
                    <h3 className="text-base font-semibold text-foreground">
                      {deal.name}
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {deal.apr !== null && (
                      <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800/50">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          APR
                        </p>
                        <p className="text-xs font-semibold">{deal.apr}%</p>
                      </div>
                    )}
                    {deal.interestRate !== null && (
                      <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800/50">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Interest
                        </p>
                        <p className="text-xs font-semibold">
                          {deal.interestRate}%
                        </p>
                      </div>
                    )}
                    {deal.creditLimit !== null && (
                      <div className="rounded-lg bg-slate-100 px-2 py-1.5 dark:bg-slate-800/50">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Limit
                        </p>
                        <p className="text-xs font-semibold">
                          {formatPrice(deal.creditLimit)}
                        </p>
                      </div>
                    )}
                  </div>
                  {deal.introRate !== null && deal.introRatePeriod !== null && (
                    <Badge
                      variant="outline"
                      className="w-fit border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                    >
                      {deal.introRate}% for {deal.introRatePeriod} months
                    </Badge>
                  )}
                  <div className="flex items-end justify-between border-t pt-4">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-medium text-muted-foreground">
                          £
                        </span>
                        <span className="text-2xl font-bold">
                          {deal.monthlyCost.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /mo
                        </span>
                      </div>
                      {deal.annualCost !== null && (
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(deal.annualCost)}/year
                        </p>
                      )}
                    </div>
                    <Button
                      asChild
                      className="bg-gradient-to-r from-[#1a365d] to-[#38a169] text-white hover:from-[#2a4a7f] hover:to-[#48bb78]"
                    >
                      <Link href={`/deals/${deal.slug}`}>View deal</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
