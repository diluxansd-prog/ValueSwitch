"use client";

import { useComparisonStore } from "@/stores/comparison-store";
import { PriceDisplay } from "@/components/shared/price-display";
import { StarRating } from "@/components/shared/star-rating";
import { getProviderColor, getProviderInitials } from "@/lib/utils/provider-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  X,
  Minus,
  Zap,
  Wifi,
  Smartphone,
  Shield,
  PiggyBank,
  Trash2,
} from "lucide-react";

const categoryIcons: Record<string, React.ElementType> = {
  energy: Zap,
  broadband: Wifi,
  mobile: Smartphone,
  insurance: Shield,
  finance: PiggyBank,
};

function FeatureCell({ value }: { value: string | number | boolean | null | undefined }) {
  if (value === null || value === undefined || value === "") {
    return <Minus className="size-4 text-muted-foreground mx-auto" />;
  }
  if (typeof value === "boolean") {
    return value ? (
      <Check className="size-5 text-green-500 mx-auto" />
    ) : (
      <X className="size-4 text-red-400 mx-auto" />
    );
  }
  return <span className="text-sm font-medium">{value}</span>;
}

export default function ComparePage() {
  const { items, removeItem, clearItems } = useComparisonStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">No plans to compare</h1>
          <p className="text-muted-foreground mb-6">
            Add 2-3 plans from our comparison pages to see them side by side.
          </p>
          <Button asChild className="bg-gradient-to-r from-[#1a365d] to-[#38a169] text-white">
            <Link href="/energy">
              <ArrowLeft className="size-4" />
              Browse deals
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const category = items[0]?.category || "energy";
  const Icon = categoryIcons[category] || Zap;

  // Build comparison rows based on category
  const rows: { label: string; key: string; format?: (v: unknown) => React.ReactNode }[] = [
    { label: "Monthly Cost", key: "monthlyCost", format: (v) => <PriceDisplay amount={v as number} period="month" size="sm" /> },
    { label: "Annual Cost", key: "annualCost", format: (v) => v ? `£${(v as number).toFixed(2)}/yr` : null },
    { label: "Setup Fee", key: "setupFee", format: (v) => v ? `£${(v as number).toFixed(2)}` : "Free" },
    { label: "Contract Length", key: "contractLength", format: (v) => v ? `${v} months` : "No contract" },
  ];

  // Add category-specific rows
  if (category === "energy") {
    rows.push(
      { label: "Unit Rate", key: "unitRate", format: (v) => v ? `${v}p/kWh` : null },
      { label: "Standing Charge", key: "standingCharge", format: (v) => v ? `${v}p/day` : null },
      { label: "Green Energy", key: "greenEnergy" },
      { label: "Tariff Type", key: "tariffType" },
    );
  } else if (category === "broadband") {
    rows.push(
      { label: "Download Speed", key: "downloadSpeed", format: (v) => v ? `${v} Mbps` : null },
      { label: "Upload Speed", key: "uploadSpeed", format: (v) => v ? `${v} Mbps` : null },
      { label: "Data Limit", key: "dataLimit", format: (v) => (v as string) || "Unlimited" },
      { label: "Includes TV", key: "includesTV" },
    );
  } else if (category === "mobile") {
    rows.push(
      { label: "Data Allowance", key: "dataAllowance" },
      { label: "Minutes", key: "minutes" },
      { label: "Texts", key: "texts" },
      { label: "Network Type", key: "networkType" },
      { label: "Includes Handset", key: "includesHandset" },
      { label: "Handset Model", key: "handsetModel" },
    );
  } else if (category === "insurance") {
    rows.push(
      { label: "Cover Level", key: "coverLevel" },
      { label: "Excess Amount", key: "excessAmount", format: (v) => v ? `£${(v as number).toFixed(2)}` : null },
    );
  } else if (category === "finance") {
    rows.push(
      { label: "APR", key: "apr", format: (v) => v ? `${v}%` : null },
      { label: "Interest Rate", key: "interestRate", format: (v) => v ? `${v}%` : null },
      { label: "Intro Rate", key: "introRate", format: (v) => v ? `${v}%` : null },
      { label: "Intro Period", key: "introRatePeriod", format: (v) => v ? `${v} months` : null },
    );
  }

  // Find cheapest plan
  const cheapestId = items.reduce((min, item) =>
    item.monthlyCost < min.monthlyCost ? item : min
  ).id;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#1a365d] to-[#2a4a7f] py-10 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <Icon className="size-6" />
            <h1 className="text-2xl font-bold sm:text-3xl">
              Compare {items.length} Plans
            </h1>
          </div>
          <p className="text-blue-100 capitalize">{category} comparison</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Provider Cards (top) */}
        <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: `200px repeat(${items.length}, 1fr)` }}>
          {/* Empty cell */}
          <div className="flex items-end pb-2">
            <Button variant="ghost" size="sm" onClick={clearItems} className="text-xs text-muted-foreground">
              <Trash2 className="size-3.5" />
              Clear all
            </Button>
          </div>
          {/* Provider columns */}
          {items.map((item) => (
            <Card key={item.id} className={cn("relative p-4 text-center", item.id === cheapestId && "ring-2 ring-green-500")}>
              {item.id === cheapestId && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px]">
                  Best Price
                </Badge>
              )}
              <button
                onClick={() => removeItem(item.id)}
                className="absolute top-2 right-2 p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive"
                aria-label={`Remove ${item.name}`}
              >
                <X className="size-4" />
              </button>
              <div className={cn("flex size-14 mx-auto items-center justify-center rounded-full text-lg font-bold text-white mb-3", getProviderColor(item.provider.name))}>
                {getProviderInitials(item.provider.name)}
              </div>
              <p className="text-xs text-muted-foreground">{item.provider.name}</p>
              <p className="text-sm font-semibold mt-1 line-clamp-2">{item.name}</p>
              {item.provider.trustScore && (
                <div className="mt-2 flex justify-center">
                  <StarRating rating={item.provider.trustScore} size={12} showValue />
                </div>
              )}
              <div className="mt-3">
                <PriceDisplay amount={item.monthlyCost} period="month" />
              </div>
              <Button size="sm" className="mt-3 w-full text-xs bg-gradient-to-r from-[#1a365d] to-[#38a169] text-white" asChild>
                <Link href={`/deals/${item.slug}`}>View deal</Link>
              </Button>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 w-[200px] min-w-[200px]">
                    Feature
                  </th>
                  {items.map((item) => (
                    <th key={item.id} className="text-center text-xs font-medium text-muted-foreground px-4 py-3 min-w-[150px]">
                      {item.provider.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.key} className={cn("border-b", idx % 2 === 0 && "bg-muted/20")}>
                    <td className="px-4 py-3 text-sm font-medium text-muted-foreground">
                      {row.label}
                    </td>
                    {items.map((item) => {
                      const raw = (item as unknown as Record<string, unknown>)[row.key];
                      const formatted = row.format ? row.format(raw) : raw;
                      return (
                        <td key={item.id} className="px-4 py-3 text-center">
                          {formatted !== null && formatted !== undefined ? (
                            typeof formatted === "object" ? (formatted as React.ReactNode) : <FeatureCell value={formatted as string | number | boolean} />
                          ) : (
                            <FeatureCell value={null} />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {/* Features row */}
                <tr className="border-b bg-muted/20">
                  <td className="px-4 py-3 text-sm font-medium text-muted-foreground">Key Features</td>
                  {items.map((item) => (
                    <td key={item.id} className="px-4 py-3 text-center">
                      {item.features && item.features.length > 0 ? (
                        <ul className="text-xs space-y-1 text-left">
                          {item.features.slice(0, 5).map((f, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <Check className="size-3 text-green-500 shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <Minus className="size-4 text-muted-foreground mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Back button */}
        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link href={`/${category}`}>
              <ArrowLeft className="size-4" />
              Back to {category} deals
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
