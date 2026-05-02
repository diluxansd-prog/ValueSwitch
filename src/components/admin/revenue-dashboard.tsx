"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  type AwinFetchResult,
  isReportSummary,
  isUnconfigured,
  isAwinError,
} from "@/lib/awin/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  PoundSterling,
  ShoppingBag,
  MousePointerClick,
  AlertCircle,
  KeyRound,
  RefreshCw,
} from "lucide-react";

function formatMoney(amount: number, currency: string = "GBP"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-GB").format(n);
}

interface Props {
  report: AwinFetchResult;
  days: number;
}

export function RevenueDashboard({ report, days }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const setRange = (d: number) => {
    startTransition(() => router.push(`/admin/revenue?days=${d}`));
  };

  if (isUnconfigured(report)) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold">Revenue dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Live commission, sales and click data from Awin's Publisher API.
          </p>
        </div>

        <Card className="border-amber-200 bg-amber-50/30 dark:bg-amber-950/10">
          <CardHeader>
            <div className="flex items-start gap-3">
              <KeyRound className="size-5 text-amber-600 mt-0.5" />
              <div>
                <CardTitle className="text-amber-900 dark:text-amber-200">
                  Awin Reports API not configured
                </CardTitle>
                <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                  {report.reason}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>To enable this dashboard, set two env vars on Vercel:</p>
            <div className="bg-white dark:bg-zinc-900 border rounded-lg p-4 font-mono text-xs space-y-1">
              <div>
                <span className="text-muted-foreground">AWIN_API_TOKEN</span>=
                <span className="text-zinc-500">your-oauth2-bearer-token</span>
              </div>
              <div>
                <span className="text-muted-foreground">AWIN_PUBLISHER_ID</span>=
                <span className="text-zinc-500">your-numeric-publisher-id</span>
              </div>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>
                Log in to{" "}
                <a
                  href="https://ui.awin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-red-600 underline"
                >
                  ui.awin.com
                </a>
                .
              </li>
              <li>
                Go to <strong>Account → API Credentials</strong> and generate an
                OAuth2 token.
              </li>
              <li>
                Copy your <strong>Publisher ID</strong> from the same page.
              </li>
              <li>
                Add both as <strong>Environment Variables</strong> on Vercel
                (Production scope is fine).
              </li>
              <li>Redeploy. This page will then show live data.</li>
            </ol>
            <p className="text-muted-foreground pt-2 border-t">
              Note: this is <em>not</em> the same key as the data-feed{" "}
              <code className="text-xs">apikey=</code> embedded in your CSV
              feed URLs — that one only works for product downloads.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAwinError(report)) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold">Revenue dashboard</h1>
        </div>
        <Card className="border-red-200 bg-red-50/30 dark:bg-red-950/10">
          <CardHeader>
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-red-600 mt-0.5" />
              <div>
                <CardTitle className="text-red-900 dark:text-red-200">
                  Awin API call failed
                </CardTitle>
                <p className="text-sm text-red-800 dark:text-red-300 mt-1 font-mono">
                  {report.error}
                </p>
                {report.status === 401 && (
                  <p className="text-sm text-red-800 dark:text-red-300 mt-2">
                    Your <code>AWIN_API_TOKEN</code> looks invalid or expired.
                    Regenerate it on Awin → Account → API Credentials.
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!isReportSummary(report)) return null;

  const epc =
    report.totalClicks > 0
      ? report.totalCommission / report.totalClicks
      : 0;
  const conversionRate =
    report.totalClicks > 0
      ? (report.totalSalesCount / report.totalClicks) * 100
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Revenue dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {report.rangeStart} → {report.rangeEnd}
            <span className="mx-2">·</span>
            <span className="text-xs">
              Updated {new Date(report.fetchedAt).toLocaleString("en-GB")}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[7, 30, 90, 365].map((d) => (
            <Button
              key={d}
              size="sm"
              variant={days === d ? "default" : "outline"}
              onClick={() => setRange(d)}
              disabled={pending}
            >
              {d === 365 ? "1y" : `${d}d`}
            </Button>
          ))}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.refresh()}
            disabled={pending}
          >
            <RefreshCw className={`size-4 ${pending ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={<PoundSterling className="size-5 text-emerald-600" />}
          label="Total commission"
          value={formatMoney(report.totalCommission, report.currency)}
          sub={`Pending ${formatMoney(report.pendingCommission, report.currency)}`}
          accent="emerald"
        />
        <SummaryCard
          icon={<TrendingUp className="size-5 text-blue-600" />}
          label="Sales value"
          value={formatMoney(report.totalSales, report.currency)}
          sub={`${formatNumber(report.totalSalesCount)} transactions`}
          accent="blue"
        />
        <SummaryCard
          icon={<MousePointerClick className="size-5 text-orange-600" />}
          label="Clicks"
          value={formatNumber(report.totalClicks)}
          sub={`EPC ${formatMoney(epc, report.currency)}`}
          accent="orange"
        />
        <SummaryCard
          icon={<ShoppingBag className="size-5 text-purple-600" />}
          label="Conversion rate"
          value={`${conversionRate.toFixed(2)}%`}
          sub={`${formatNumber(report.totalImpressions)} impressions`}
          accent="purple"
        />
      </div>

      {/* Status breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Commission by status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatusRow
              label="Confirmed"
              value={report.confirmedCommission}
              count={report.confirmedCount}
              currency={report.currency}
              colour="text-emerald-600"
            />
            <StatusRow
              label="Pending"
              value={report.pendingCommission}
              count={report.pendingCount}
              currency={report.currency}
              colour="text-amber-600"
            />
            <StatusRow
              label="Declined"
              value={report.declinedCommission}
              count={report.declinedCount}
              currency={report.currency}
              colour="text-red-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Per-advertiser table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">By merchant</CardTitle>
        </CardHeader>
        <CardContent>
          {report.perAdvertiser.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No data in this period yet.
            </p>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Merchant</th>
                    <th className="py-2 pr-4 font-medium text-right">Clicks</th>
                    <th className="py-2 pr-4 font-medium text-right">Sales</th>
                    <th className="py-2 pr-4 font-medium text-right">Sale value</th>
                    <th className="py-2 pr-4 font-medium text-right">Commission</th>
                    <th className="py-2 pr-2 font-medium text-right">EPC</th>
                  </tr>
                </thead>
                <tbody>
                  {report.perAdvertiser.map((r) => {
                    const rowEpc =
                      r.clicks > 0 ? (r.totalComm?.amount || 0) / r.clicks : 0;
                    return (
                      <tr key={r.advertiserId} className="border-b last:border-0">
                        <td className="py-3 pr-4">
                          <div className="font-medium">{r.advertiserName}</div>
                          <div className="text-xs text-muted-foreground">
                            MID {r.advertiserId}
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums">
                          {formatNumber(r.clicks)}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums">
                          {formatNumber(r.totalNo)}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums">
                          {formatMoney(r.totalValue?.amount || 0, r.currency)}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums font-medium">
                          {formatMoney(r.totalComm?.amount || 0, r.currency)}
                        </td>
                        <td className="py-3 pr-2 text-right tabular-nums text-muted-foreground">
                          {formatMoney(rowEpc, r.currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Data via{" "}
        <Link
          href="https://wiki.awin.com/index.php/API"
          target="_blank"
          className="underline"
        >
          Awin Publisher Reports API
        </Link>
        . Cached for 10 minutes.
      </p>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent: "emerald" | "blue" | "orange" | "purple";
}) {
  const ring = {
    emerald: "ring-emerald-500/10",
    blue: "ring-blue-500/10",
    orange: "ring-orange-500/10",
    purple: "ring-purple-500/10",
  }[accent];
  return (
    <Card className={`ring-1 ${ring}`}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{sub}</div>
      </CardContent>
    </Card>
  );
}

function StatusRow({
  label,
  value,
  count,
  currency,
  colour,
}: {
  label: string;
  value: number;
  count: number;
  currency: string;
  colour: string;
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Badge variant="outline" className="text-xs">
          {formatNumber(count)}
        </Badge>
      </div>
      <div className={`text-lg font-semibold tabular-nums ${colour}`}>
        {formatMoney(value, currency)}
      </div>
    </div>
  );
}
