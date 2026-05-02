import type { Metadata } from "next";
import { fetchAwinAggregated } from "@/lib/awin/reports";
import { RevenueDashboard } from "@/components/admin/revenue-dashboard";

export const metadata: Metadata = {
  title: "Revenue | Admin",
  description: "Awin commission, sales and click data.",
};

export const dynamic = "force-dynamic";

interface SearchParams {
  days?: string;
}

export default async function AdminRevenuePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const days = Math.max(1, Math.min(365, parseInt(sp.days || "30", 10) || 30));

  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

  const report = await fetchAwinAggregated({ startDate, endDate });

  return <RevenueDashboard report={report} days={days} />;
}
