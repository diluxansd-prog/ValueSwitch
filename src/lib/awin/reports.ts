/**
 * Awin Publisher Reports API client.
 *
 * Docs: https://wiki.awin.com/index.php/API
 *
 * Auth: Bearer OAuth2 token from Awin → Account → API Credentials
 *       (this is DIFFERENT from the data-feed apikey embedded in feed URLs).
 *
 * If AWIN_API_TOKEN or AWIN_PUBLISHER_ID is unset, every function in this
 * module returns { configured: false, ... } so callers can render a
 * graceful "set up" state instead of crashing.
 */

const BASE = "https://api.awin.com";

export interface AwinMoney {
  amount: number;
  currency: string;
}

export interface AwinAggregatedRow {
  advertiserId: number;
  advertiserName: string;
  publisherId: number;
  region: string;
  currency: string;
  impressions: number;
  clicks: number;
  pendingNo: number;
  pendingValue: AwinMoney;
  pendingComm: AwinMoney;
  confirmedNo: number;
  confirmedValue: AwinMoney;
  confirmedComm: AwinMoney;
  bonusNo: number;
  bonusValue: AwinMoney;
  bonusComm: AwinMoney;
  totalNo: number;
  totalValue: AwinMoney;
  totalComm: AwinMoney;
  declinedNo: number;
  declinedValue: AwinMoney;
  declinedComm: AwinMoney;
}

export interface AwinReportSummary {
  configured: true;
  rangeStart: string;
  rangeEnd: string;
  totalCommission: number;
  totalSales: number;
  totalSalesCount: number;
  totalClicks: number;
  totalImpressions: number;
  pendingCommission: number;
  pendingCount: number;
  confirmedCommission: number;
  confirmedCount: number;
  declinedCommission: number;
  declinedCount: number;
  currency: string;
  perAdvertiser: AwinAggregatedRow[];
  fetchedAt: string;
}

export interface AwinUnconfigured {
  configured: false;
  reason: string;
}

export interface AwinError {
  configured: true;
  error: string;
  status?: number;
}

export type AwinFetchResult =
  | AwinReportSummary
  | AwinUnconfigured
  | AwinError;

function isConfigured(): { token: string; publisherId: string } | null {
  const token = process.env.AWIN_API_TOKEN;
  const publisherId = process.env.AWIN_PUBLISHER_ID;
  if (!token || !publisherId) return null;
  return { token, publisherId };
}

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Fetch aggregated report for the given date range, grouped by advertiser.
 * Defaults to the last 30 days. Returns full breakdown + summary totals.
 */
export async function fetchAwinAggregated(opts?: {
  startDate?: Date;
  endDate?: Date;
  region?: string;
}): Promise<AwinFetchResult> {
  const cfg = isConfigured();
  if (!cfg) {
    return {
      configured: false,
      reason: "AWIN_API_TOKEN and AWIN_PUBLISHER_ID env vars must be set.",
    };
  }

  const endDate = opts?.endDate || new Date();
  const startDate =
    opts?.startDate || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  const region = opts?.region || "GB";

  const params = new URLSearchParams({
    startDate: fmtDate(startDate),
    endDate: fmtDate(endDate),
    region,
    timezone: "UTC",
  });

  const url = `${BASE}/publishers/${cfg.publisherId}/reports/advertiser?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        Accept: "application/json",
      },
      next: { revalidate: 600 }, // cache 10 min — reports update slowly
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        configured: true,
        error: `Awin API HTTP ${res.status}${text ? `: ${text.slice(0, 200)}` : ""}`,
        status: res.status,
      };
    }

    const rows = (await res.json()) as AwinAggregatedRow[];

    let totalCommission = 0;
    let totalSales = 0;
    let totalSalesCount = 0;
    let totalClicks = 0;
    let totalImpressions = 0;
    let pendingCommission = 0;
    let pendingCount = 0;
    let confirmedCommission = 0;
    let confirmedCount = 0;
    let declinedCommission = 0;
    let declinedCount = 0;
    let currency = "GBP";

    for (const r of rows) {
      totalCommission += r.totalComm?.amount || 0;
      totalSales += r.totalValue?.amount || 0;
      totalSalesCount += r.totalNo || 0;
      totalClicks += r.clicks || 0;
      totalImpressions += r.impressions || 0;
      pendingCommission += r.pendingComm?.amount || 0;
      pendingCount += r.pendingNo || 0;
      confirmedCommission += r.confirmedComm?.amount || 0;
      confirmedCount += r.confirmedNo || 0;
      declinedCommission += r.declinedComm?.amount || 0;
      declinedCount += r.declinedNo || 0;
      if (r.currency) currency = r.currency;
    }

    rows.sort(
      (a, b) => (b.totalComm?.amount || 0) - (a.totalComm?.amount || 0)
    );

    return {
      configured: true,
      rangeStart: fmtDate(startDate),
      rangeEnd: fmtDate(endDate),
      totalCommission,
      totalSales,
      totalSalesCount,
      totalClicks,
      totalImpressions,
      pendingCommission,
      pendingCount,
      confirmedCommission,
      confirmedCount,
      declinedCommission,
      declinedCount,
      currency,
      perAdvertiser: rows,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      configured: true,
      error: err instanceof Error ? err.message : "fetch failed",
    };
  }
}

export function isReportSummary(r: AwinFetchResult): r is AwinReportSummary {
  return r.configured === true && !("error" in r);
}

export function isUnconfigured(r: AwinFetchResult): r is AwinUnconfigured {
  return r.configured === false;
}

export function isAwinError(r: AwinFetchResult): r is AwinError {
  return r.configured === true && "error" in r;
}
