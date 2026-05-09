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

  // Per-merchant diagnostic data.  Anything that helps the operator
  // figure out "why aren't this merchant's deals showing on the site?"
  // belongs here — env-var status, provider record presence, current
  // plan count, last import timestamp, last error message.
  const merchantStatus = await Promise.all(
    MERCHANT_FEEDS.map(async (m) => {
      const provider = await prisma.provider.findUnique({
        where: { slug: m.slug },
        select: { id: true, isActive: true },
      });

      // Plan count + most-recent updatedAt as a proxy for "was the
      // last refresh successful for this merchant"
      const [planCount, latest] = provider
        ? await Promise.all([
            prisma.plan.count({ where: { providerId: provider.id } }),
            prisma.plan.findFirst({
              where: { providerId: provider.id },
              orderBy: { updatedAt: "desc" },
              select: { updatedAt: true },
            }),
          ])
        : [0, null];

      // Walk back through recent CronRun rows looking for the most
      // recent run that touched THIS merchant — gives us its last
      // error (if any) without scanning the entire table.
      let lastError: string | null = null;
      let lastRunAt: string | null = null;
      let lastRunOk: boolean | null = null;
      for (const r of runs) {
        if (!r.summary) continue;
        try {
          const summary = JSON.parse(r.summary) as {
            perMerchant?: Array<{
              merchant: string;
              ok: boolean;
              error?: string | null;
            }>;
          };
          const hit = summary.perMerchant?.find((pm) => pm.merchant === m.slug);
          if (hit) {
            lastRunAt = r.startedAt.toISOString();
            lastRunOk = hit.ok;
            lastError = hit.error ?? null;
            break;
          }
        } catch {
          // Ignore unparseable summaries
        }
      }

      return {
        slug: m.slug,
        name: m.name,
        envVar: m.feedUrlEnv,
        configured: Boolean(process.env[m.feedUrlEnv]),
        cronSkip: Boolean(m.cronSkip),
        category: m.category,
        awinMerchantId: m.awinMerchantId,
        providerExists: Boolean(provider),
        providerActive: provider?.isActive ?? false,
        planCount,
        lastImportAt: latest?.updatedAt?.toISOString() ?? null,
        lastRunAt,
        lastRunOk,
        lastError,
      };
    })
  );

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
