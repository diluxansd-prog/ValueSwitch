/**
 * Passive database health, recorded from queries the app already makes.
 *
 * The first version of the health endpoint ran its own `SELECT 1` every
 * 30 seconds. Neon only suspends a compute after 5 minutes idle, so that
 * probe alone kept the database awake around the clock and billed
 * roughly 5 CU-hours a day for an otherwise idle site. Watching real
 * queries costs nothing and tells us the same thing.
 */
type Observation = { ok: boolean; at: number };

const globalForDbStatus = globalThis as unknown as {
  __dbStatus?: Observation | null;
};

/** How long an observation is treated as current. */
export const OBSERVATION_TTL_MS = 180_000;

export function recordDbOutcome(ok: boolean): void {
  globalForDbStatus.__dbStatus = { ok, at: Date.now() };
}

/** Last known state, or null when nothing recent has been observed. */
export function getRecentDbStatus(): Observation | null {
  const seen = globalForDbStatus.__dbStatus;
  if (!seen) return null;
  if (Date.now() - seen.at > OBSERVATION_TTL_MS) return null;
  return seen;
}

/** Connection-level failures mean "database unreachable"; a bad query doesn't. */
export function isConnectionError(err: unknown): boolean {
  const name = (err as { name?: string })?.name ?? "";
  const code = (err as { code?: string })?.code ?? "";
  const msg = err instanceof Error ? err.message : String(err);
  return (
    name === "PrismaClientInitializationError" ||
    code === "P1001" ||
    code === "P1002" ||
    code === "P1017" ||
    /can't reach database server|connection (closed|refused|terminated)/i.test(msg)
  );
}
