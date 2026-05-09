/**
 * Orphaned-CronRun reaper.
 *
 * Background: every cron route creates a CronRun row at the start
 * (finishedAt = null) and updates it at the end.  If the function
 * crashes or hits Vercel's 60-second function timeout in between,
 * the row never gets finalized and shows as "still running" forever
 * in the admin UI.  This was masking real failures — 7 consecutive
 * price-alert runs in May 2026 looked like they were running when
 * they had all timed out.
 *
 * The reaper runs at the START of every new cron invocation and
 * marks any CronRun for the same job that's been "running" for more
 * than `STUCK_AFTER_MS` as `ok=false` with a clear error message.
 *
 * Cheap (single UPDATE), idempotent (no side effects on already-final
 * rows), safe (only touches rows whose finishedAt is null and which
 * are old enough that they can't be a concurrent run).
 */
import { prisma } from "@/lib/prisma";

/** Anything still "running" after this is treated as orphaned/timed-out. */
export const STUCK_AFTER_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Finalize any CronRun rows for the given jobName that have been
 * "running" longer than the threshold.  Returns count of rows reaped.
 *
 * Safe to call concurrently — uses startedAt as the cutoff so we
 * never collide with a freshly-started run.
 */
export async function reapOrphanedRuns(jobName: string): Promise<number> {
  const cutoff = new Date(Date.now() - STUCK_AFTER_MS);
  const result = await prisma.cronRun.updateMany({
    where: {
      jobName,
      finishedAt: null,
      startedAt: { lt: cutoff },
    },
    data: {
      finishedAt: new Date(),
      ok: false,
      error: `Run did not complete — likely timed out (Vercel 60s function limit) or crashed. Auto-finalized after ${STUCK_AFTER_MS / 60_000}min idle.`,
      summary: JSON.stringify({
        status: "orphaned",
        reapedAt: new Date().toISOString(),
      }),
    },
  });
  return result.count;
}

/**
 * Same idea but matches all jobs whose name STARTS with `prefix`.
 * Used for `refresh-feed:<merchant>` per-merchant manual runs.
 */
export async function reapOrphanedRunsByPrefix(
  prefix: string
): Promise<number> {
  const cutoff = new Date(Date.now() - STUCK_AFTER_MS);
  const result = await prisma.cronRun.updateMany({
    where: {
      jobName: { startsWith: prefix },
      finishedAt: null,
      startedAt: { lt: cutoff },
    },
    data: {
      finishedAt: new Date(),
      ok: false,
      error: `Run did not complete — likely timed out (Vercel 60s function limit) or crashed. Auto-finalized after ${STUCK_AFTER_MS / 60_000}min idle.`,
      summary: JSON.stringify({
        status: "orphaned",
        reapedAt: new Date().toISOString(),
      }),
    },
  });
  return result.count;
}
