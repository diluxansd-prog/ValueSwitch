/**
 * Generate opinionated "Best for X" labels for deal cards.
 *
 * The point: differentiate ValueSwitch from generic comparison sites
 * (MoneySupermarket, Compare the Market, etc.) by having a *take* on each
 * deal — not just dumping price + spec.
 *
 * Single source of truth so listings, deal pages and search all use the
 * same labels.
 */

import type { PlanWithProvider } from "@/types/comparison";

export interface OpinionatedBadge {
  label: string;
  emoji?: string;
  tone: "good" | "great" | "info" | "value";
  /** Higher = shows first when multiple apply */
  priority: number;
}

export function getOpinionatedBadges(
  plan: PlanWithProvider,
  context?: {
    cheapestInCategory?: number;
    fastestSpeed?: number;
    avgPrice?: number;
  }
): OpinionatedBadge[] {
  const out: OpinionatedBadge[] = [];

  // ─── PRICE-BASED ───
  if (
    context?.cheapestInCategory != null &&
    plan.monthlyCost === context.cheapestInCategory
  ) {
    out.push({
      label: "Cheapest right now",
      emoji: "💸",
      tone: "great",
      priority: 100,
    });
  }
  if (
    context?.avgPrice != null &&
    plan.monthlyCost < context.avgPrice * 0.7
  ) {
    out.push({
      label: "Below average price",
      emoji: "📉",
      tone: "good",
      priority: 60,
    });
  }
  if (plan.setupFee === 0 && plan.subcategory !== "sim-free") {
    out.push({
      label: "No upfront cost",
      emoji: "🎁",
      tone: "good",
      priority: 50,
    });
  }

  // ─── BROADBAND-SPECIFIC ───
  if (plan.subcategory === "fibre") {
    if (plan.downloadSpeed && plan.downloadSpeed >= 900) {
      out.push({
        label: "Gigabit speed",
        emoji: "⚡",
        tone: "great",
        priority: 90,
      });
    }
    if (
      context?.fastestSpeed != null &&
      plan.downloadSpeed === context.fastestSpeed
    ) {
      out.push({
        label: "Fastest available",
        emoji: "🚀",
        tone: "great",
        priority: 95,
      });
    }
    if (plan.contractLength && plan.contractLength <= 12) {
      out.push({
        label: "Short contract",
        emoji: "📅",
        tone: "info",
        priority: 30,
      });
    }
  }

  // ─── MOBILE / SIM-ONLY ───
  if (plan.subcategory === "sim-only") {
    const data = (plan.dataAllowance || "").toLowerCase();
    if (data.includes("unlimited")) {
      out.push({
        label: "Unlimited data",
        emoji: "♾️",
        tone: "great",
        priority: 80,
      });
    } else {
      const gb = parseInt(data.replace(/[^\d]/g, ""), 10);
      if (gb >= 100) {
        out.push({
          label: "100GB+ data",
          emoji: "📊",
          tone: "good",
          priority: 50,
        });
      }
    }
    if (plan.contractLength === 1) {
      out.push({
        label: "30-day rolling",
        emoji: "🔄",
        tone: "info",
        priority: 40,
      });
    }
  }

  // ─── HANDSET CONTRACT ───
  if (plan.subcategory === "contract" && plan.includesHandset) {
    if (plan.monthlyCost <= 15) {
      out.push({
        label: "Budget contract",
        emoji: "💷",
        tone: "value",
        priority: 70,
      });
    }
  }

  // ─── SIM-FREE ───
  if (plan.subcategory === "sim-free") {
    if (/refurbished/i.test(plan.name)) {
      out.push({
        label: "Refurbished",
        emoji: "♻️",
        tone: "info",
        priority: 30,
      });
    }
    if (/brand\s*new/i.test(plan.name)) {
      out.push({
        label: "Brand new",
        emoji: "✨",
        tone: "info",
        priority: 35,
      });
    }
  }

  // ─── PROVIDER-SPECIFIC ───
  if (plan.provider.slug === "ecotalk") {
    out.push({
      label: "Profits to wildlife",
      emoji: "🌿",
      tone: "info",
      priority: 75,
    });
  }
  if (plan.provider.slug === "yourcoop") {
    out.push({
      label: "Co-operative",
      emoji: "🤝",
      tone: "info",
      priority: 65,
    });
  }
  if (plan.provider.slug === "ttfone") {
    out.push({
      label: "Easy to use",
      emoji: "👵",
      tone: "info",
      priority: 60,
    });
  }
  if (plan.handsetModel === "Doro") {
    out.push({
      label: "Senior-friendly",
      emoji: "📱",
      tone: "info",
      priority: 55,
    });
  }

  // 5G connectivity
  if (plan.networkType?.toUpperCase() === "5G") {
    out.push({
      label: "5G ready",
      emoji: "📶",
      tone: "info",
      priority: 25,
    });
  }

  return out.sort((a, b) => b.priority - a.priority).slice(0, 2);
}

export const TONE_STYLES: Record<OpinionatedBadge["tone"], string> = {
  great: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
  good: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
  value: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
  info: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
};
