import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { CronControlClient } from "@/components/admin/cron-control";

export const metadata: Metadata = {
  title: "Scheduled Jobs | Admin | ValueSwitch",
};
export const dynamic = "force-dynamic";

export default async function AdminCronPage() {
  const runs = await prisma.cronRun.findMany({
    orderBy: { startedAt: "desc" },
    take: 50,
  });

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
      feedConfigured={!!process.env.AWIN_VODAFONE_FEED_URL}
      cronSecretSet={!!process.env.CRON_SECRET}
    />
  );
}
