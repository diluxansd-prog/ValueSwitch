"use client";

import { useState } from "react";
import { Loader2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * Runs the idempotent repair statements in /api/admin/migrate (schema
 * drift, stale-deal retirement, impossible phone prices, feed text
 * encoding). Safe to click any time — every statement is repeatable.
 */
export function DataRepairButton() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string[] | null>(null);

  async function run() {
    setRunning(true);
    try {
      const res = await fetch("/api/admin/migrate", { method: "POST" });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        applied?: string[];
        failed?: { id: string; error: string }[];
        error?: string;
      } | null;
      if (!res.ok || !data) {
        toast.error(data?.error ?? `Repair failed (HTTP ${res.status})`);
        return;
      }
      const lines = [
        ...(data.applied ?? []).map((a) => {
          const [id, n] = a.split(":");
          return n && n !== "0" ? `${id}: ${n} rows` : `${id}: nothing to do`;
        }),
        ...(data.failed ?? []).map((f) => `${f.id}: FAILED — ${f.error}`),
      ];
      setResult(lines);
      if (data.ok) toast.success("Data repair complete");
      else toast.error("Some repair steps failed — see details");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Repair failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
        <div>
          <p className="text-sm font-semibold">Data repair</p>
          <p className="text-xs text-muted-foreground">
            Retires stale and impossible-price deals, fixes feed text and
            schema drift. Safe to run any time.
          </p>
        </div>
        <Button onClick={run} disabled={running} variant="outline" size="sm">
          {running ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Wrench className="size-4" />
          )}
          Run data repair
        </Button>
        {result && (
          <ul className="w-full space-y-0.5 font-mono text-[11px] text-muted-foreground">
            {result.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
