"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { TrendingUp, Star, Megaphone, ExternalLink, Signal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ProviderLogo } from "@/components/shared/provider-logo";
import { useComparisonStore } from "@/stores/comparison-store";
import { cn } from "@/lib/utils";
import {
  getOpinionatedBadges,
  TONE_STYLES,
} from "@/lib/opinionated-badges";
import type { PlanWithProvider } from "@/types/comparison";

interface ComparisonCardProps {
  plan: PlanWithProvider;
}

/**
 * Render the opinionated "Best for X" badges + structural feature chips
 * (network, handset model). Only shows the row when at least one item
 * applies, so cards without any tags don't grow a useless empty strip.
 */
function CardBottomBadges({ plan }: { plan: PlanWithProvider }) {
  const opinionated = getOpinionatedBadges(plan);
  const hasFeatures = plan.networkType || (plan.includesHandset && plan.handsetModel);
  if (opinionated.length === 0 && !hasFeatures) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-border/40">
      {opinionated.map((b) => (
        <Badge
          key={b.label}
          variant="outline"
          className={cn(
            "text-[10px] px-2 py-0.5 font-medium border",
            TONE_STYLES[b.tone]
          )}
        >
          {b.emoji && <span className="mr-1">{b.emoji}</span>}
          {b.label}
        </Badge>
      ))}
      {plan.networkType && (
        <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-normal">
          <Signal className="size-2.5 mr-1" />
          {plan.networkType}
        </Badge>
      )}
      {plan.includesHandset && plan.handsetModel && (
        <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-normal">
          {plan.handsetModel}
        </Badge>
      )}
    </div>
  );
}

/**
 * Three-tier image fallback for a plan card thumbnail:
 *   1. The product image (Awin CDN / merchant CDN), if present and loads.
 *   2. The provider logo, via ProviderLogo (which itself falls back).
 *   3. Provider initials in a coloured-gradient avatar.
 * Never renders a broken-image icon.
 */
function PlanThumbnail({ plan }: { plan: PlanWithProvider }) {
  const [imgErrored, setImgErrored] = useState(false);
  const showProduct = plan.imageUrl && !imgErrored;

  if (showProduct) {
    return (
      <div className="relative size-12 shrink-0 rounded-lg bg-slate-50 dark:bg-slate-800/50 overflow-hidden">
        <Image
          src={plan.imageUrl!}
          alt={plan.name}
          fill
          className="object-contain p-1"
          sizes="48px"
          onError={() => setImgErrored(true)}
        />
      </div>
    );
  }

  return (
    <ProviderLogo
      name={plan.provider.name}
      slug={plan.provider.slug}
      logo={plan.provider.logo}
      size={42}
    />
  );
}

export function ComparisonCard({ plan }: ComparisonCardProps) {
  const { addItem, removeItem, isInBasket } = useComparisonStore();
  const inBasket = isInBasket(plan.id);

  function handleCompareToggle() {
    if (inBasket) removeItem(plan.id);
    else addItem(plan);
  }

  // Parse price into pounds and pence
  const priceWhole = Math.floor(plan.monthlyCost);
  const pricePence = Math.round((plan.monthlyCost - priceWhole) * 100);

  return (
    <Card
      className={cn(
        "group relative border border-border/60 transition-all hover:shadow-md",
        inBasket && "ring-2 ring-[#38a169]/50 border-[#38a169]/30"
      )}
    >
      {/* Top badges */}
      {(plan.isPromoted || plan.isBestValue) && (
        <div className="flex items-center justify-between px-5 pt-3">
          <div className="flex gap-1.5">
            {plan.isBestValue && (
              <Badge className="bg-emerald-500 text-white text-[10px] px-2 py-0.5">
                <TrendingUp className="size-3 mr-1" />
                Best Value
              </Badge>
            )}
          </div>
          {plan.isPromoted && (
            <span className="text-[11px] text-muted-foreground font-medium">Promoted</span>
          )}
        </div>
      )}

      <CardContent className="p-5">
        {/* Main row: Provider | Deal info | Data | Price | CTA */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">

          {/* Provider + Deal name */}
          <div className="flex items-center gap-3 sm:w-[200px] sm:shrink-0">
            <PlanThumbnail plan={plan} />
            {/*
              PlanThumbnail prefers the product image, falls back to the
              provider logo, and falls back again to a coloured-initials
              avatar — never renders a broken image.
            */}
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">{plan.provider.name}</p>
              <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
                {plan.name.replace(/ - £[\d.]+\/mo.*/, "")}
              </h3>
            </div>
          </div>

          {/* Data / Minutes / Texts - big stats */}
          <div className="flex items-center gap-4 sm:gap-6 sm:flex-1">
            {plan.dataAllowance && (
              <div className="text-center">
                <p className="text-2xl font-bold tracking-tight">
                  {plan.dataAllowance.replace(/GB/i, "")}
                  <span className="text-sm font-medium text-muted-foreground ml-0.5">GB</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {plan.networkType ? `of ${plan.networkType} data` : "data"}
                </p>
              </div>
            )}
            {plan.minutes && (
              <div className="text-center">
                <p className="text-sm font-semibold">{plan.minutes}</p>
                <p className="text-[10px] text-muted-foreground">minutes</p>
              </div>
            )}
            {plan.texts && (
              <div className="text-center">
                <p className="text-sm font-semibold">{plan.texts}</p>
                <p className="text-[10px] text-muted-foreground">texts</p>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="text-center sm:text-right sm:shrink-0">
            <div className="flex items-baseline gap-0.5 sm:justify-end">
              <span className="text-lg font-bold text-foreground">£{priceWhole}</span>
              {pricePence > 0 && (
                <span className="text-lg font-bold">.{pricePence.toString().padStart(2, "0")}</span>
              )}
              <span className="text-sm text-muted-foreground ml-0.5">
                {plan.subcategory === "sim-free" ? "total" : "a month"}
              </span>
            </div>
            {plan.subcategory === "sim-free" ? (
              <p className="text-[11px] text-muted-foreground">SIM-free, no contract</p>
            ) : (
              <>
                {plan.contractLength && plan.contractLength > 1 && (
                  <p className="text-[11px] text-muted-foreground">{plan.contractLength} month contract</p>
                )}
                {plan.contractLength === 1 && (
                  <p className="text-[11px] text-muted-foreground">No contract</p>
                )}
                {plan.setupFee > 0 && (
                  <p className="text-[11px] text-muted-foreground">£{plan.setupFee.toFixed(2)} upfront</p>
                )}
              </>
            )}
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-2 sm:shrink-0">
            <Button
              asChild
              className="bg-[#1a365d] text-white hover:bg-[#2a4a7f] font-semibold px-6"
            >
              <Link href={`/deals/${plan.slug}`}>
                View deal
              </Link>
            </Button>
            <label className="flex items-center gap-1.5 justify-center cursor-pointer">
              <Checkbox
                checked={inBasket}
                onCheckedChange={handleCompareToggle}
                className="size-3.5"
              />
              <span className="text-[10px] text-muted-foreground">Compare</span>
            </label>
          </div>
        </div>

        {/* Opinionated badges + feature tags */}
        <CardBottomBadges plan={plan} />
      </CardContent>
    </Card>
  );
}
