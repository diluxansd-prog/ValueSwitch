"use client";

import Link from "next/link";
import { X, ArrowRightLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/shared/price-display";
import { useComparisonStore } from "@/stores/comparison-store";
import { cn } from "@/lib/utils";

const providerColors = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-rose-500",
  "bg-cyan-500",
];

export function CompareDrawer() {
  const { items, removeItem, clearItems } = useComparisonStore();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 shadow-2xl backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="size-4 text-[#38a169]" />
            <span className="text-sm font-semibold">
              Compare ({items.length}/3)
            </span>
          </div>

          <div className="flex flex-1 items-center gap-2 overflow-x-auto">
            {items.map((item) => {
              const colorIndex =
                item.provider.name
                  .split("")
                  .reduce((acc, c) => acc + c.charCodeAt(0), 0) % 6;
              const initials = item.provider.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <div
                  key={item.id}
                  className="flex shrink-0 items-center gap-2 rounded-lg border bg-card px-3 py-1.5"
                >
                  <div
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white",
                      providerColors[colorIndex]
                    )}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">{item.name}</p>
                    <PriceDisplay
                      amount={item.monthlyCost}
                      period="month"
                      size="sm"
                    />
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="ml-1 rounded p-0.5 text-muted-foreground hover:text-destructive"
                    aria-label={`Remove ${item.name} from comparison`}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              );
            })}
            {Array.from({ length: 3 - items.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex size-[52px] shrink-0 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground"
              >
                +
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearItems}
              className="text-xs text-muted-foreground"
            >
              <Trash2 className="size-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
            {items.length >= 2 && (
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#1a365d] to-[#38a169] text-white hover:from-[#2a4a7f] hover:to-[#48bb78]"
                asChild
              >
                <Link href={`/deals/${items[0].slug}`}>
                  Compare now
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
