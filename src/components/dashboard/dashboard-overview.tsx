"use client";

import Link from "next/link";
import {
  Search,
  Bell,
  ArrowRightLeft,
  Zap,
  Wifi,
  Smartphone,
  Shield,
  PiggyBank,
  Building2,
  TrendingUp,
  Clock,
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

interface DashboardOverviewProps {
  userName: string;
  stats: {
    savedSearches: number;
    activeAlerts: number;
    comparisons: number;
  };
  recentComparisons: {
    id: string;
    category: string;
    subcategory: string | null;
    resultCount: number;
    createdAt: string;
  }[];
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

const quickActions = [
  { label: "Compare Energy", href: "/energy", icon: Zap, color: "from-yellow-500 to-orange-500" },
  { label: "Compare Broadband", href: "/broadband", icon: Wifi, color: "from-blue-500 to-cyan-500" },
  { label: "Compare Mobile", href: "/mobile", icon: Smartphone, color: "from-purple-500 to-pink-500" },
  { label: "Compare Insurance", href: "/insurance", icon: Shield, color: "from-green-500 to-emerald-500" },
  { label: "Compare Finance", href: "/finance", icon: PiggyBank, color: "from-emerald-500 to-teal-500" },
  { label: "Business Services", href: "/business", icon: Building2, color: "from-slate-600 to-slate-800" },
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function DashboardOverviewClient({
  userName,
  stats,
  recentComparisons,
}: DashboardOverviewProps) {
  const firstName = userName.split(" ")[0];
  const hasActivity =
    stats.savedSearches > 0 ||
    stats.activeAlerts > 0 ||
    stats.comparisons > 0;

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s an overview of your comparison activity.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saved Searches
            </CardTitle>
            <Search className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.savedSearches}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Quick access to your searches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Alerts
            </CardTitle>
            <Bell className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeAlerts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Monitoring prices for you
            </p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Comparisons Made
            </CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.comparisons}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total comparisons run
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent comparisons */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Comparisons</CardTitle>
            <CardDescription>Your latest comparison activity</CardDescription>
          </CardHeader>
          <CardContent>
            {recentComparisons.length > 0 ? (
              <div className="space-y-3">
                {recentComparisons.map((comparison) => {
                  const Icon =
                    categoryIcons[comparison.category.toLowerCase()] ||
                    ArrowRightLeft;
                  const colorClass =
                    categoryColors[comparison.category.toLowerCase()] ||
                    "bg-gray-100 text-gray-700";

                  return (
                    <div
                      key={comparison.id}
                      className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div
                        className={`flex items-center justify-center size-10 rounded-lg shrink-0 ${colorClass}`}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium capitalize">
                          {comparison.category}
                          {comparison.subcategory && (
                            <span className="text-muted-foreground">
                              {" "}
                              / {comparison.subcategory}
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="secondary" className="text-xs">
                            {comparison.resultCount} results
                          </Badge>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="size-3" />
                            {formatDate(comparison.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <Link href="/dashboard/comparison-history">
                  <Button variant="ghost" size="sm" className="w-full mt-2">
                    View all comparisons
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex items-center justify-center size-12 rounded-full bg-muted mb-3">
                  <ArrowRightLeft className="size-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No comparisons yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
                  Start comparing deals to see your history here
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Compare</CardTitle>
            <CardDescription>
              Jump straight into a comparison
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <div className="flex items-center gap-3 rounded-lg border p-3 transition-all hover:shadow-md hover:border-[#38a169]/30 cursor-pointer group">
                    <div
                      className={`flex items-center justify-center size-10 rounded-lg bg-gradient-to-br ${action.color} text-white shrink-0 group-hover:scale-105 transition-transform`}
                    >
                      <action.icon className="size-5" />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA if no data */}
      {!hasActivity && (
        <Card className="border-dashed border-2 border-[#38a169]/30 bg-gradient-to-r from-[#1a365d]/5 to-[#38a169]/5">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex items-center justify-center size-16 rounded-full bg-gradient-to-br from-[#1a365d] to-[#38a169] mb-4">
              <Plus className="size-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold">
              Start saving on your bills
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Compare energy, broadband, mobile, and insurance deals to find the
              best prices. Save your searches and set up price alerts to never
              miss a deal.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <Button asChild>
                <Link
                  href="/energy"
                  className="bg-gradient-to-r from-[#1a365d] to-[#38a169] hover:from-[#2a4a7f] hover:to-[#48bb78] text-white border-0"
                >
                  <Zap className="size-4" />
                  Compare Energy
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/broadband">
                  <Wifi className="size-4" />
                  Compare Broadband
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
