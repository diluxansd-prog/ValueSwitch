"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface CronRun {
  id: string;
  jobName: string;
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  ok: boolean;
  error: string | null;
  summary: string | null;
}

interface MerchantStatus {
  slug: string;
  name: string;
  envVar: string;
  configured: boolean;
}

interface PerMerchantSummary {
  merchant: string;
  ok: boolean;
  counts?: {
    totalRows: number;
    uniqueDeals: number;
    created: number;
    updated: number;
    unchanged: number;
    priceChanges: number;
    errors: number;
  };
  error?: string | null;
}

interface ParsedSummary {
  totalMerchants?: number;
  totalSucceeded?: number;
  totalFailed?: number;
  skipped?: Array<{ merchant: string; reason: string }>;
  perMerchant?: PerMerchantSummary[];
  // legacy single-merchant runs:
  totalRows?: number;
  created?: number;
  updated?: number;
  priceChanges?: number;
  errors?: number;
}

interface Props {
  runs: CronRun[];
  merchants: MerchantStatus[];
  cronSecretSet: boolean;
}

function relTime(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function parseSummary(raw: string | null): ParsedSummary | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ParsedSummary;
  } catch {
    return null;
  }
}

export function CronControlClient({
  runs,
  merchants,
  cronSecretSet,
}: Props) {
  const router = useRouter();
  const [running, setRunning] = useState(false);

  const configuredCount = merchants.filter((m) => m.configured).length;
  const anyConfigured = configuredCount > 0;

  async function runNow() {
    if (running) return;
    setRunning(true);
    toast.info(
      `Refreshing ${configuredCount} merchant feed${configuredCount === 1 ? "" : "s"}... takes 30-60s`
    );
    try {
      const res = await fetch("/api/cron/refresh-feed", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        const totals = (data.perMerchant || []).reduce(
          (acc: { c: number; u: number; p: number }, r: PerMerchantSummary) => ({
            c: acc.c + (r.counts?.created || 0),
            u: acc.u + (r.counts?.updated || 0),
            p: acc.p + (r.counts?.priceChanges || 0),
          }),
          { c: 0, u: 0, p: 0 }
        );
        toast.success(
          `✅ ${data.totalSucceeded}/${data.totalMerchants} merchants · ${totals.c} created · ${totals.u} updated · ${totals.p} price changes`
        );
      } else if (data.totalFailed > 0) {
        toast.warning(
          `⚠️ ${data.totalSucceeded} ok · ${data.totalFailed} failed — see run history`
        );
      } else {
        toast.error(`Job failed: ${data.error || "unknown error"}`);
      }
      router.refresh();
    } catch (err) {
      toast.error(
        `Trigger failed: ${err instanceof Error ? err.message : "unknown"}`
      );
    } finally {
      setRunning(false);
    }
  }

  const lastSuccess = runs.find((r) => r.ok);
  const consecutiveFailures = (() => {
    let n = 0;
    for (const r of runs) {
      if (!r.finishedAt) continue;
      if (r.ok) break;
      n++;
    }
    return n;
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scheduled Jobs</h1>
          <p className="text-muted-foreground mt-1">
            Weekly multi-merchant feed refresh · Runs Sunday 03:00 UTC
          </p>
        </div>
        <Button
          onClick={runNow}
          disabled={running || !anyConfigured}
          className="bg-gradient-to-r from-[#1a365d] to-[#38a169] text-white hover:from-[#2a4a7f] hover:to-[#48bb78]"
        >
          {running ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Refreshing {configuredCount} feed{configuredCount === 1 ? "" : "s"}...
            </>
          ) : (
            <>
              <Play className="size-4" />
              Run now
            </>
          )}
        </Button>
      </div>

      {/* Merchant feed status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="size-4" />
            Merchant Feeds
            <Badge variant="outline" className="ml-auto">
              {configuredCount}/{merchants.length} configured
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {merchants.map((m) => (
              <div
                key={m.slug}
                className={`flex items-center justify-between rounded-lg border p-3 ${
                  m.configured
                    ? "bg-green-500/5 border-green-500/20"
                    : "bg-muted/30 border-border/40"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold">{m.name}</p>
                  <p className="text-xs font-mono text-muted-foreground mt-0.5">
                    {m.envVar}
                  </p>
                </div>
                {m.configured ? (
                  <CheckCircle2 className="size-5 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="size-5 text-muted-foreground/40 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Config warnings */}
      {(!anyConfigured || !cronSecretSet) && (
        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 shrink-0 text-orange-500 mt-0.5" />
              <div className="text-sm space-y-2">
                <p className="font-semibold">Setup required</p>
                {!anyConfigured && (
                  <p>
                    No merchant feeds are configured yet. Set at least one of
                    the <code className="text-xs">*_FEED_URL</code> env vars
                    above to enable the cron.
                  </p>
                )}
                {!cronSecretSet && (
                  <p>
                    <code className="text-xs">CRON_SECRET</code> is not set.
                    Vercel needs this to authenticate scheduled runs. Generate
                    one with <code className="text-xs">openssl rand -hex 32</code>.
                  </p>
                )}
                <p className="text-xs text-muted-foreground pt-1">
                  Get each feed URL from Awin Dashboard → Toolbox →
                  Create-A-Feed → the merchant → &ldquo;Download URL&rdquo;.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Total runs</p>
            <p className="text-3xl font-bold mt-1">{runs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Last success</p>
            <p className="text-xl font-semibold mt-1">
              {lastSuccess ? relTime(lastSuccess.startedAt) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card
          className={
            consecutiveFailures > 0 ? "border-red-500/30 bg-red-500/5" : ""
          }
        >
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Consecutive failures</p>
            <p
              className={`text-3xl font-bold mt-1 ${consecutiveFailures > 0 ? "text-red-500" : ""}`}
            >
              {consecutiveFailures}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Run history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="size-5" />
            Run history
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {runs.map((run) => {
              const summary = parseSummary(run.summary);
              const perMerchant = summary?.perMerchant;
              const totals = perMerchant
                ? perMerchant.reduce(
                    (acc, r) => ({
                      created: acc.created + (r.counts?.created || 0),
                      updated: acc.updated + (r.counts?.updated || 0),
                      priceChanges:
                        acc.priceChanges + (r.counts?.priceChanges || 0),
                      errors: acc.errors + (r.counts?.errors || 0),
                    }),
                    { created: 0, updated: 0, priceChanges: 0, errors: 0 }
                  )
                : null;
              return (
                <div key={run.id} className="flex items-start gap-3 p-4">
                  <div className="mt-0.5 shrink-0">
                    {run.finishedAt ? (
                      run.ok ? (
                        <CheckCircle2 className="size-5 text-green-500" />
                      ) : (
                        <XCircle className="size-5 text-red-500" />
                      )
                    ) : (
                      <Loader2 className="size-5 text-blue-500 animate-spin" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{run.jobName}</span>
                      <Badge variant="outline" className="text-xs">
                        {relTime(run.startedAt)}
                      </Badge>
                      {summary?.totalMerchants != null && (
                        <Badge variant="secondary" className="text-xs">
                          {summary.totalSucceeded}/{summary.totalMerchants} merchants
                        </Badge>
                      )}
                      {run.durationMs != null && (
                        <span className="text-xs text-muted-foreground">
                          {(run.durationMs / 1000).toFixed(1)}s
                        </span>
                      )}
                    </div>

                    {/* Aggregate totals across all merchants */}
                    {totals && (
                      <div className="flex gap-3 text-xs text-muted-foreground mt-1.5">
                        <span>
                          <b className="text-foreground">{totals.created}</b> created
                        </span>
                        <span>
                          <b className="text-foreground">{totals.updated}</b> updated
                        </span>
                        <span>
                          <b className="text-foreground">{totals.priceChanges}</b> price changes
                        </span>
                        {totals.errors > 0 && (
                          <span className="text-red-500">
                            <b>{totals.errors}</b> errors
                          </span>
                        )}
                      </div>
                    )}

                    {/* Per-merchant breakdown */}
                    {perMerchant && perMerchant.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {perMerchant.map((pm) => (
                          <div
                            key={pm.merchant}
                            className={`flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded border ${
                              pm.ok
                                ? "bg-green-500/5 border-green-500/20 text-green-700 dark:text-green-300"
                                : "bg-red-500/5 border-red-500/20 text-red-700 dark:text-red-300"
                            }`}
                            title={pm.error || ""}
                          >
                            {pm.ok ? (
                              <CheckCircle2 className="size-3" />
                            ) : (
                              <XCircle className="size-3" />
                            )}
                            {pm.merchant}
                            {pm.ok && pm.counts && (
                              <span className="opacity-70">
                                · +{pm.counts.created}/{pm.counts.updated}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Legacy (pre-multi-merchant) summaries */}
                    {!perMerchant && summary?.created != null && (
                      <div className="flex gap-3 text-xs text-muted-foreground mt-1.5">
                        <span>
                          <b className="text-foreground">{summary.created}</b> created
                        </span>
                        <span>
                          <b className="text-foreground">{summary.updated}</b> updated
                        </span>
                        <span>
                          <b className="text-foreground">{summary.priceChanges}</b> price changes
                        </span>
                      </div>
                    )}

                    {run.error && (
                      <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-mono break-words">
                        {run.error}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {runs.length === 0 && (
              <div className="p-8 text-center">
                <RefreshCw className="size-8 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No runs yet. Scheduled Sunday 03:00 UTC, or click &ldquo;Run
                  now&rdquo; above.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
