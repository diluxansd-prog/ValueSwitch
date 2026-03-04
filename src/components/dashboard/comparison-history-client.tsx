"use client";

import Link from "next/link";
import {
  History,
  ExternalLink,
  Zap,
  Wifi,
  Smartphone,
  Shield,
  PiggyBank,
  Building2,
  MapPin,
  Calendar,
  Hash,
  ArrowRightLeft,
  Plus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ComparisonRecord {
  id: string;
  category: string;
  subcategory: string | null;
  postcode: string | null;
  resultCount: number;
  createdAt: string;
}

const categoryIcons: Record<string, typeof Zap> = {
  energy: Zap,
  broadband: Wifi,
  mobile: Smartphone,
  insurance: Shield,
  finance: PiggyBank,
  business: Building2,
};

const categoryColors: Record<string, string> = {
  energy: "bg-yellow-100 text-yellow-700",
  broadband: "bg-blue-100 text-blue-700",
  mobile: "bg-purple-100 text-purple-700",
  insurance: "bg-green-100 text-green-700",
  finance: "bg-emerald-100 text-emerald-700",
  business: "bg-slate-100 text-slate-700",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ComparisonHistoryClient({
  comparisons,
}: {
  comparisons: ComparisonRecord[];
}) {
  // Group comparisons by date
  const grouped = comparisons.reduce<Record<string, ComparisonRecord[]>>(
    (acc, comparison) => {
      const dateKey = formatDate(comparison.createdAt);
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(comparison);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Comparison History
        </h1>
        <p className="mt-1 text-muted-foreground">
          {comparisons.length > 0
            ? `You have made ${comparisons.length} comparison${comparisons.length !== 1 ? "s" : ""} so far.`
            : "View and re-run your past comparisons."}
        </p>
      </div>

      {comparisons.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Calendar className="size-4" />
                {date}
              </h2>
              <div className="grid gap-3">
                {items.map((comparison) => {
                  const Icon =
                    categoryIcons[comparison.category.toLowerCase()] ||
                    ArrowRightLeft;
                  const colorClass =
                    categoryColors[comparison.category.toLowerCase()] ||
                    "bg-gray-100 text-gray-700";

                  const href = comparison.subcategory
                    ? `/${comparison.category.toLowerCase()}/${comparison.subcategory}`
                    : `/${comparison.category.toLowerCase()}`;

                  return (
                    <Card
                      key={comparison.id}
                      className="transition-shadow hover:shadow-md"
                    >
                      <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                        <div
                          className={`flex items-center justify-center size-11 rounded-lg shrink-0 ${colorClass}`}
                        >
                          <Icon className="size-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold capitalize">
                            {comparison.category}
                            {comparison.subcategory && (
                              <span className="text-muted-foreground font-normal">
                                {" "}
                                / {comparison.subcategory}
                              </span>
                            )}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge
                              variant="secondary"
                              className="text-xs flex items-center gap-1"
                            >
                              <Hash className="size-3" />
                              {comparison.resultCount} results
                            </Badge>
                            {comparison.postcode && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="size-3" />
                                {comparison.postcode}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatTime(comparison.createdAt)}
                            </span>
                          </div>
                        </div>

                        <Button size="sm" variant="outline" asChild>
                          <Link href={href}>
                            <ExternalLink className="size-4" />
                            <span className="hidden sm:inline">
                              View again
                            </span>
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex items-center justify-center size-16 rounded-full bg-muted mb-4">
              <History className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No comparisons yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Your comparison history will appear here once you start comparing
              deals across our categories.
            </p>
            <Button
              asChild
              className="mt-6 bg-gradient-to-r from-[#1a365d] to-[#38a169] hover:from-[#2a4a7f] hover:to-[#48bb78] text-white border-0"
            >
              <Link href="/energy">
                <Plus className="size-4" />
                Start comparing
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
