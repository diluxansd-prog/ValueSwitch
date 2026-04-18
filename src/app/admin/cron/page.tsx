import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { CronControlClient } from "@/components/admin/cron-control";
import { MERCHANT_FEEDS } from "@/config/merchants";

export const metadata: Metadata = {
  title: "Scheduled Jobs | Admin | ValueSwitch",
};
export const dynamic = "force-dynamic";

export default async function AdminCronPage() {
  const runs = await prisma.cronRun.findMany({
    orderBy: { startedAt: "desc" },
    take: 50,
  });

  // Show per-merchant config status so user knows which feeds are wired
  const merchantStatus = MERCHANT_FEEDS.map((m) => ({
    slug: m.slug,
    name: m.name,
    envVar: m.feedUrlEnv,
    configured: Boolean(process.env[m.feedUrlEnv]),
  }));

  return (
    <CronControlClient
      runs={runs.map((r) => ({
        id: r.id,
        jobName: r.jobName,
        startedAt: r.startedAt.toISOString(),
        finishedAt: r.finishedAt?.toISOString() || null,
        durationMs: r.durationMs,
        ok: r.ok,
        error: r.error,
        summary: r.summary,
      }))}
      merchants={merchantStatus}
      cronSecretSet={Boolean(process.env.CRON_SECRET)}
    />
  );
}
