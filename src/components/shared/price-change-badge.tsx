import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceChangeBadgeProps {
  currentPrice: number;
  previousPrice: number | null;
  className?: string;
}

/**
 * Shows price change vs the last recorded price.
 *  - Price dropped → green "was £X, save £Y"
 *  - Price rose   → orange "was £X, up £Y"
 *  - Unchanged    → nothing (no badge)
 */
export function PriceChangeBadge({
  currentPrice,
  previousPrice,
  className,
}: PriceChangeBadgeProps) {
  if (previousPrice == null || previousPrice === currentPrice) return null;

  const diff = currentPrice - previousPrice;
  const absDiff = Math.abs(diff);
  const dropped = diff < 0;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        dropped
          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
          : "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
        className
      )}
    >
      {dropped ? (
        <TrendingDown className="size-3.5" />
      ) : (
        <TrendingUp className="size-3.5" />
      )}
      <span className="line-through opacity-60">
        £{previousPrice.toFixed(2)}
      </span>
      <span className="font-bold">
        {dropped ? "Save" : "+"}£{absDiff.toFixed(2)}
      </span>
    </div>
  );
}

interface PriceTrendProps {
  history: Array<{ monthlyCost: number; recordedAt: string | Date }>;
  currentPrice: number;
}

/**
 * Tiny sparkline-ish summary for a deal page:
 * "Price has been stable for X days" / "Price dropped 3 times in the last month"
 */
export function PriceTrend({ history, currentPrice }: PriceTrendProps) {
  if (history.length < 2) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Minus className="size-3.5" />
        <span>Price is new — we&apos;ll track changes from here</span>
      </div>
    );
  }

  const sorted = [...history].sort(
    (a, b) =>
      new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );
  const oldest = sorted[0].monthlyCost;
  const first = sorted[0].recordedAt;
  const days = Math.round(
    (Date.now() - new Date(first).getTime()) / 86_400_000
  );

  let drops = 0;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].monthlyCost < sorted[i - 1].monthlyCost) drops++;
  }

  if (oldest === currentPrice) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Minus className="size-3.5" />
        <span>Stable price for {days} day{days !== 1 ? "s" : ""}</span>
      </div>
    );
  }

  const dropped = currentPrice < oldest;
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs font-medium",
        dropped ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"
      )}
    >
      {dropped ? (
        <TrendingDown className="size-3.5" />
      ) : (
        <TrendingUp className="size-3.5" />
      )}
      <span>
        {dropped ? "Dropped" : "Increased"} from £{oldest.toFixed(2)} — {drops} price{drops !== 1 ? "s" : ""} tracked over {days} day{days !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
