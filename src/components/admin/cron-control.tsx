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
  cronSkip: boolean;
  category: string;
  awinMerchantId: string;
  providerExists: boolean;
  providerActive: boolean;
  planCount: number;
  /** Most recent updatedAt across this merchant's plans — proxy for
   *  "did the last refresh actually write data for this merchant?" */
  lastImportAt: string | null;
  /** Most recent CronRun that touched this merchant */
  lastRunAt: string | null;
  lastRunOk: boolean | null;
  lastError: string | null;
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

      <MerchantDiagnostics merchants={merchants} />

      {/* Setup instructions card — shown only if at least one merchant
          is configured but problems were detected, or no merchant has
          plans live on the site yet. */}
      <SetupHints merchants={merchants} />

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

/**
 * Per-merchant diagnostic panel.
 *
 * Three things make this actually useful (vs the previous configured/not
 * grid):
 *  1. Plan count per merchant — instantly shows which merchants are
 *     LIVE on the site vs which are silent.
 *  2. Last import timestamp — tells you whether the data is fresh or
 *     hasn't refreshed in weeks.
 *  3. Last error message — if a feed fetch failed, the operator can
 *     read the actual HTTP error or parse error without digging through
 *     the run history.
 *  4. Per-merchant "Refresh now" — runs ONE merchant immediately, useful
 *     when debugging Awin feed problems with a specific partner.
 */
function MerchantDiagnostics({ merchants }: { merchants: MerchantStatus[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const liveCount = merchants.filter((m) => m.planCount > 0).length;
  const configuredCount = merchants.filter((m) => m.configured).length;
  const skippedCount = merchants.filter((m) => m.cronSkip).length;

  async function refreshOne(slug: string) {
    if (busy) return;
    setBusy(slug);
    toast.info(`Refreshing ${slug}... up to 30s`);
    try {
      const res = await fetch(`/api/admin/refresh-merchant/${slug}`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.ok) {
        const c = data.counts;
        toast.success(
          `✅ ${slug}: ${c.created} created · ${c.updated} updated · ${c.priceChanges} price changes`
        );
      } else {
        toast.error(`❌ ${slug}: ${data.error || "unknown error"}`, {
          duration: 10_000,
        });
      }
      router.refresh();
    } catch (err) {
      toast.error(
        `Trigger failed: ${err instanceof Error ? err.message : "unknown"}`
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 flex-wrap">
          <Building2 className="size-4" />
          Merchant feeds
          <span className="ml-auto flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className="bg-emerald-500/5 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
            >
              {liveCount} live on site
            </Badge>
            <Badge variant="outline">{configuredCount} configured</Badge>
            {skippedCount > 0 && (
              <Badge variant="outline" className="text-muted-foreground">
                {skippedCount} skipped
              </Badge>
            )}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-3 lg:grid-cols-2">
          {merchants.map((m) => (
            <MerchantCard
              key={m.slug}
              m={m}
              onRefresh={() => refreshOne(m.slug)}
              busy={busy === m.slug}
              busyOther={busy !== null && busy !== m.slug}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MerchantCard({
  m,
  onRefresh,
  busy,
  busyOther,
}: {
  m: MerchantStatus;
  onRefresh: () => void;
  busy: boolean;
  busyOther: boolean;
}) {
  // Status bucket determines the card colour.
  // - red: env var set OR cronSkip=false, but plan count is 0 (broken)
  // - amber: cronSkip=true (intentionally inactive, kept for affiliate links only)
  // - amber: env var not set (action needed)
  // - green: live with plans
  const status: "live" | "broken" | "skipped" | "unset" = (() => {
    if (m.cronSkip) return "skipped";
    if (!m.configured) return "unset";
    if (m.planCount === 0) return "broken";
    return "live";
  })();

  const tone = {
    live: "bg-emerald-500/5 border-emerald-500/25",
    broken: "bg-red-500/5 border-red-500/30",
    skipped: "bg-muted/30 border-border/40",
    unset: "bg-amber-500/5 border-amber-500/30",
  }[status];

  return (
    <div className={`rounded-xl border p-4 ${tone}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold">{m.name}</p>
            <Badge variant="outline" className="text-[10px] capitalize">
              {m.category}
            </Badge>
            <span className="text-[10px] font-mono text-muted-foreground">
              MID {m.awinMerchantId}
            </span>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
            {m.envVar}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        <Stat
          label="Live deals"
          value={m.planCount.toLocaleString("en-GB")}
          highlight={m.planCount === 0}
        />
        <Stat label="Last import" value={m.lastImportAt ? relTime(m.lastImportAt) : "—"} />
        <Stat
          label="Last run"
          value={
            m.lastRunAt
              ? `${relTime(m.lastRunAt)} ${m.lastRunOk ? "✓" : "✗"}`
              : "—"
          }
        />
      </div>

      {/* Provider record check */}
      {!m.providerExists && (
        <div className="mt-3 flex items-start gap-2 rounded-md bg-red-500/10 border border-red-500/30 px-2.5 py-1.5">
          <XCircle className="size-3.5 text-red-500 mt-0.5 shrink-0" />
          <p className="text-xs">
            <strong>No Provider record</strong> — create one in{" "}
            <code className="text-[10px]">/admin/providers</code> with slug
            <code className="text-[10px] mx-0.5">{m.slug}</code>.
          </p>
        </div>
      )}

      {m.providerExists && !m.providerActive && (
        <div className="mt-3 flex items-start gap-2 rounded-md bg-amber-500/10 border border-amber-500/30 px-2.5 py-1.5">
          <AlertTriangle className="size-3.5 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs">
            Provider record is marked <strong>inactive</strong>. Stats and pages
            will hide it. Toggle isActive in{" "}
            <code className="text-[10px]">/admin/providers</code>.
          </p>
        </div>
      )}

      {/* Most recent error */}
      {m.lastError && (
        <div className="mt-3 rounded-md bg-red-500/5 border border-red-500/20 px-2.5 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">
            Last error
          </p>
          <p className="text-xs font-mono text-red-700 dark:text-red-300 break-words">
            {m.lastError.length > 300
              ? m.lastError.slice(0, 297) + "…"
              : m.lastError}
          </p>
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center justify-between gap-2 mt-3">
        <p className="text-[11px] text-muted-foreground">
          {status === "skipped"
            ? "cronSkip flag set — link generator still works"
            : status === "unset"
              ? "Add the env var on Vercel to enable the feed"
              : status === "broken"
                ? "Configured but no deals on site — check the error above"
                : "Imported and live on the site"}
        </p>
        {m.providerExists && (
          <Button
            size="sm"
            variant={status === "broken" ? "default" : "outline"}
            disabled={busy || busyOther || !m.configured}
            onClick={onRefresh}
            className="h-7 text-xs"
          >
            {busy ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                Running…
              </>
            ) : (
              <>
                <RefreshCw className="size-3" />
                Refresh now
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-md px-2 py-1.5 ${highlight ? "bg-red-500/10" : "bg-background/60"}`}
    >
      <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
        {label}
      </p>
      <p
        className={`text-sm font-bold tabular-nums ${highlight ? "text-red-600 dark:text-red-400" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "live" | "broken" | "skipped" | "unset";
}) {
  const map = {
    live: {
      label: "Live",
      className:
        "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
    },
    broken: {
      label: "Broken",
      className: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/40",
    },
    skipped: {
      label: "Skipped",
      className: "bg-muted text-muted-foreground border-border/60",
    },
    unset: {
      label: "Not configured",
      className:
        "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/40",
    },
  }[status];
  return (
    <Badge variant="outline" className={`${map.className} shrink-0`}>
      {map.label}
    </Badge>
  );
}

/**
 * Surface specific setup hints when we detect common problems.
 * Keeps the operator from having to know all the failure modes.
 */
function SetupHints({ merchants }: { merchants: MerchantStatus[] }) {
  const broken = merchants.filter(
    (m) => m.configured && !m.cronSkip && m.planCount === 0
  );
  const missingProvider = merchants.filter(
    (m) => !m.providerExists && m.configured
  );
  const inactiveProvider = merchants.filter(
    (m) => m.providerExists && !m.providerActive && m.planCount > 0
  );
  if (broken.length === 0 && missingProvider.length === 0 && inactiveProvider.length === 0) {
    return null;
  }

  return (
    <Card className="border-orange-500/30 bg-orange-500/5">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="size-4 shrink-0 text-orange-500 mt-0.5" />
          <p className="text-sm font-semibold">
            What to check when a merchant&apos;s deals don&apos;t appear
          </p>
        </div>
        <ol className="text-sm space-y-2 text-muted-foreground list-decimal pl-5">
          <li>
            <strong className="text-foreground">Awin approval status.</strong>{" "}
            Sign into your Awin publisher dashboard → Programmes → confirm the
            merchant is <em>Joined</em>. &ldquo;Pending&rdquo; or &ldquo;Suspended&rdquo;
            means no feed access yet.
          </li>
          <li>
            <strong className="text-foreground">Feed availability.</strong>{" "}
            Awin Toolbox → Create-A-Feed → search the merchant. If they don&apos;t appear
            in the list, the merchant hasn&apos;t enabled product feeds for publishers
            (some run banner-only programmes). Email{" "}
            <a
              href="mailto:publisher@awin.com"
              className="underline text-foreground"
            >
              publisher@awin.com
            </a>{" "}
            and ask them to push the merchant to enable a product feed.
          </li>
          <li>
            <strong className="text-foreground">Feed URL set on Vercel.</strong>{" "}
            Project Settings → Environment Variables → confirm the{" "}
            <code className="text-xs">*_FEED_URL</code> exists and points to a fresh
            Awin download URL (they expire after ~90 days, regenerate if needed).
          </li>
          <li>
            <strong className="text-foreground">Provider record.</strong> Each
            merchant needs a row in <code className="text-xs">Provider</code>{" "}
            with the matching <code className="text-xs">slug</code>.
            Add via <code className="text-xs">/admin/providers</code>.
          </li>
          <li>
            <strong className="text-foreground">Try a manual refresh.</strong>{" "}
            Click &ldquo;Refresh now&rdquo; on the merchant card above —
            you&apos;ll see the exact error if the feed fetch fails.
          </li>
        </ol>
        {broken.length > 0 && (
          <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-xs">
            <p className="font-semibold text-red-700 dark:text-red-400">
              Broken right now:{" "}
              {broken.map((m) => m.name).join(", ")}
            </p>
            <p className="text-muted-foreground mt-1">
              Configured but currently importing zero deals. Click their
              &ldquo;Refresh now&rdquo; buttons to see the live error.
            </p>
          </div>
        )}
        {missingProvider.length > 0 && (
          <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-xs">
            <p className="font-semibold text-red-700 dark:text-red-400">
              Missing Provider record:{" "}
              {missingProvider.map((m) => m.name).join(", ")}
            </p>
            <p className="text-muted-foreground mt-1">
              Imports will throw — create the Provider record first.
            </p>
          </div>
        )}
        {inactiveProvider.length > 0 && (
          <div className="rounded-md bg-amber-500/10 border border-amber-500/30 p-3 text-xs">
            <p className="font-semibold text-amber-700 dark:text-amber-400">
              Hidden by isActive=false:{" "}
              {inactiveProvider.map((m) => m.name).join(", ")}
            </p>
            <p className="text-muted-foreground mt-1">
              Plans exist in the DB but the provider is inactive — site filters
              it out. Toggle in <code className="text-xs">/admin/providers</code>.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
