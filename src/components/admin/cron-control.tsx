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

interface Props {
  runs: CronRun[];
  feedConfigured: boolean;
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

export function CronControlClient({
  runs,
  feedConfigured,
  cronSecretSet,
}: Props) {
  const router = useRouter();
  const [running, setRunning] = useState(false);

  async function runNow() {
    if (running) return;
    setRunning(true);
    toast.info("Starting feed refresh — this takes 30-60 seconds...");
    try {
      const res = await fetch("/api/cron/refresh-feed", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        const c = data.counts;
        toast.success(
          `✅ Created ${c.created}, updated ${c.updated}, ${c.priceChanges} price changes`
        );
      } else {
        toast.error(`Job failed: ${data.error || "unknown error"}`);
      }
      router.refresh();
    } catch (err) {
      toast.error(`Trigger failed: ${err instanceof Error ? err.message : "unknown"}`);
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
            Automated weekly feed refresh · Runs Sunday 03:00 UTC
          </p>
        </div>
        <Button
          onClick={runNow}
          disabled={running || !feedConfigured}
          className="bg-gradient-to-r from-[#1a365d] to-[#38a169] text-white hover:from-[#2a4a7f] hover:to-[#48bb78]"
        >
          {running ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="size-4" />
              Run now
            </>
          )}
        </Button>
      </div>

      {/* Config status banner */}
      {(!feedConfigured || !cronSecretSet) && (
        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 shrink-0 text-orange-500 mt-0.5" />
              <div className="text-sm space-y-2">
                <p className="font-semibold">Setup required</p>
                <p>Set these env vars on Vercel for the cron to work:</p>
                <ul className="space-y-1.5 font-mono text-xs">
                  <li className="flex items-center gap-2">
                    {feedConfigured ? (
                      <CheckCircle2 className="size-3.5 text-green-500" />
                    ) : (
                      <XCircle className="size-3.5 text-red-500" />
                    )}
                    AWIN_VODAFONE_FEED_URL
                  </li>
                  <li className="flex items-center gap-2">
                    {cronSecretSet ? (
                      <CheckCircle2 className="size-3.5 text-green-500" />
                    ) : (
                      <XCircle className="size-3.5 text-red-500" />
                    )}
                    CRON_SECRET
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground pt-1">
                  Find the feed URL in Awin Dashboard → Toolbox → Create-A-Feed → your Vodafone feed → &ldquo;Download URL&rdquo;.
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
              let counts: Record<string, number> | null = null;
              try {
                counts = run.summary ? JSON.parse(run.summary) : null;
              } catch {
                /* ignore */
              }
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
                      {run.durationMs != null && (
                        <span className="text-xs text-muted-foreground">
                          {(run.durationMs / 1000).toFixed(1)}s
                        </span>
                      )}
                    </div>
                    {counts && (
                      <div className="flex gap-3 text-xs text-muted-foreground mt-1.5">
                        <span>
                          <b className="text-foreground">{counts.created}</b> created
                        </span>
                        <span>
                          <b className="text-foreground">{counts.updated}</b> updated
                        </span>
                        <span>
                          <b className="text-foreground">{counts.priceChanges}</b> price changes
                        </span>
                        {counts.errors > 0 && (
                          <span className="text-red-500">
                            <b>{counts.errors}</b> errors
                          </span>
                        )}
                      </div>
                    )}
                    {run.error && (
                      <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-mono">
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
                  No runs yet. Scheduled Sunday 03:00 UTC, or click &ldquo;Run now&rdquo; above.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
