"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Leaf, TrendingUp, Star, Megaphone, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PriceDisplay } from "@/components/shared/price-display";
import { StarRating } from "@/components/shared/star-rating";
import { useComparisonStore } from "@/stores/comparison-store";
import { formatPrice } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PlanWithProvider } from "@/types/comparison";

interface ComparisonCardProps {
  plan: PlanWithProvider;
}

export function ComparisonCard({ plan }: ComparisonCardProps) {
  const { addItem, removeItem, isInBasket } = useComparisonStore();
  const inBasket = isInBasket(plan.id);
  const [isHovered, setIsHovered] = useState(false);

  const initials = plan.provider.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Generate a consistent color from the provider name
  const colorIndex =
    plan.provider.name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    6;
  const providerColors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-rose-500",
    "bg-cyan-500",
  ];

  function handleCompareToggle() {
    if (inBasket) {
      removeItem(plan.id);
    } else {
      addItem(plan);
    }
  }

  function renderSpecs() {
    switch (plan.category) {
      case "energy":
        return (
          <div className="grid grid-cols-3 gap-2 text-center">
            {plan.tariffType && (
              <div className="rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-800/50">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Tariff
                </p>
                <p className="text-xs font-semibold">{plan.tariffType}</p>
              </div>
            )}
            {plan.unitRate !== null && (
              <div className="rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-800/50">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Unit Rate
                </p>
                <p className="text-xs font-semibold">{plan.unitRate}p/kWh</p>
              </div>
            )}
            {plan.standingCharge !== null && (
              <div className="rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-800/50">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Standing
                </p>
                <p className="text-xs font-semibold">
                  {plan.standingCharge}p/day
                </p>
              </div>
            )}
          </div>
        );
      case "broadband":
        return (
          <div className="grid grid-cols-3 gap-2 text-center">
            {plan.downloadSpeed !== null && (
              <div className="rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-800/50">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Download
                </p>
                <p className="text-xs font-semibold">
                  {plan.downloadSpeed} Mbps
                </p>
              </div>
            )}
            {plan.uploadSpeed !== null && (
              <div className="rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-800/50">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Upload
                </p>
                <p className="text-xs font-semibold">
                  {plan.uploadSpeed} Mbps
                </p>
              </div>
            )}
            <div className="rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-800/50">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Data
              </p>
              <p className="text-xs font-semibold">
                {plan.dataLimit || "Unlimited"}
              </p>
            </div>
          </div>
        );
      case "mobile":
        return (
          <div className="grid grid-cols-3 gap-2 text-center">
            {plan.dataAllowance && (
              <div className="rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-800/50">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Data
                </p>
                <p className="text-xs font-semibold">{plan.dataAllowance}</p>
              </div>
            )}
            {plan.minutes && (
              <div className="rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-800/50">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Minutes
                </p>
                <p className="text-xs font-semibold">{plan.minutes}</p>
              </div>
            )}
            {plan.texts && (
              <div className="rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-800/50">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Texts
                </p>
                <p className="text-xs font-semibold">{plan.texts}</p>
              </div>
            )}
          </div>
        );
      case "insurance":
        return (
          <div className="grid grid-cols-2 gap-2 text-center">
            {plan.coverLevel && (
              <div className="rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-800/50">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Cover
                </p>
                <p className="text-xs font-semibold">{plan.coverLevel}</p>
              </div>
            )}
            {plan.excessAmount !== null && (
              <div className="rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-800/50">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Excess
                </p>
                <p className="text-xs font-semibold">
                  {formatPrice(plan.excessAmount ?? 0)}
                </p>
              </div>
            )}
          </div>
        );
      case "finance":
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
            {plan.apr !== null && (
              <div className="rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-800/50">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  APR
                </p>
                <p className="text-xs font-semibold">{plan.apr}%</p>
              </div>
            )}
            {plan.interestRate !== null && (
              <div className="rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-800/50">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Interest
                </p>
                <p className="text-xs font-semibold">{plan.interestRate}%</p>
              </div>
            )}
            {plan.creditLimit !== null && (
              <div className="rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-800/50">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Limit
                </p>
                <p className="text-xs font-semibold">
                  {formatPrice(plan.creditLimit)}
                </p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <Card
      className={cn(
        "group relative border border-border/60 transition-all duration-300",
        isHovered && "shadow-lg -translate-y-0.5",
        inBasket && "ring-2 ring-[#38a169]/50 border-[#38a169]/30"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Feature badges - top */}
      {(plan.isPromoted || plan.isBestValue || plan.isPopular) && (
        <div className="absolute -top-0 left-4 flex gap-1">
          {plan.isPromoted && (
            <Badge className="rounded-t-none rounded-b-md bg-[#1a365d] text-white hover:bg-[#1a365d]">
              <Megaphone className="size-3" />
              Promoted
            </Badge>
          )}
          {plan.isBestValue && (
            <Badge className="rounded-t-none rounded-b-md bg-[#38a169] text-white hover:bg-[#38a169]">
              <TrendingUp className="size-3" />
              Best Value
            </Badge>
          )}
          {plan.isPopular && !plan.isBestValue && !plan.isPromoted && (
            <Badge className="rounded-t-none rounded-b-md bg-orange-500 text-white hover:bg-orange-500">
              <Star className="size-3" />
              Popular
            </Badge>
          )}
        </div>
      )}

      <CardContent className="flex flex-col gap-3 sm:gap-4 p-4 pt-6 sm:p-6 sm:pt-8">
        {/* Provider info */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {plan.imageUrl ? (
              <div className="relative size-14 shrink-0 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-1">
                <Image
                  src={plan.imageUrl}
                  alt={plan.name}
                  fill
                  className="object-contain p-1"
                  sizes="56px"
                />
              </div>
            ) : (
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
                  providerColors[colorIndex]
                )}
              >
                {initials}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {plan.provider.name}
              </p>
              <h3 className="text-base font-semibold text-foreground">
                {plan.name}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={inBasket}
              onCheckedChange={handleCompareToggle}
              aria-label="Add to comparison"
            />
            <span className="text-xs text-muted-foreground">Compare</span>
          </div>
        </div>

        {/* Rating */}
        {plan.rating !== null && plan.provider.trustScore !== null && (
          <StarRating
            rating={plan.rating}
            size={14}
            showValue
            reviewCount={plan.provider.reviewCount}
          />
        )}

        {/* Key specs */}
        {renderSpecs()}

        {/* Feature badges */}
        <div className="flex flex-wrap gap-1.5">
          {plan.greenEnergy && (
            <Badge
              variant="outline"
              className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
            >
              <Leaf className="size-3" />
              Green Energy
            </Badge>
          )}
          {plan.includesTV && (
            <Badge variant="outline">Includes TV</Badge>
          )}
          {plan.includesHandset && plan.handsetModel && (
            <Badge variant="outline">{plan.handsetModel}</Badge>
          )}
          {plan.networkType && (
            <Badge variant="outline">{plan.networkType}</Badge>
          )}
          {plan.contractLength && (
            <Badge variant="secondary">
              {plan.contractLength} month contract
            </Badge>
          )}
          {plan.introRate !== null && plan.introRatePeriod !== null && (
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400"
            >
              {plan.introRate}% for {plan.introRatePeriod} months
            </Badge>
          )}
        </div>

        {/* Pricing */}
        <div className="flex items-end justify-between border-t pt-4">
          <div>
            <PriceDisplay
              amount={plan.monthlyCost}
              period="month"
              size="lg"
            />
            {plan.annualCost !== null && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatPrice(plan.annualCost)}/year
              </p>
            )}
            {plan.setupFee > 0 && (
              <p className="text-xs text-muted-foreground">
                + {formatPrice(plan.setupFee)} setup
              </p>
            )}
          </div>
          <Button
            asChild
            className="bg-gradient-to-r from-[#1a365d] to-[#38a169] text-white hover:from-[#2a4a7f] hover:to-[#48bb78]"
          >
            <Link href={`/deals/${plan.slug}`}>
              View deal
              <ExternalLink className="ml-1 size-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
