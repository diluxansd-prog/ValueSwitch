import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { getDisplayOffers } from "@/lib/offers-live";
import { OFFER_CATEGORY_LABELS } from "@/lib/offers";

export const metadata: Metadata = {
  title: "Offers | Admin | ValueSwitch",
};
// Always fetch fresh — the admin wants the live state, not the daily cache.
export const dynamic = "force-dynamic";

/**
 * Admin view of everything the public /offers page serves: curated
 * entries from src/lib/offers.ts plus live Awin Promotions API rows,
 * with the fetch diagnostic surfaced so a broken pipeline is obvious.
 */
export default async function AdminOffersPage() {
  const { offers, note } = await getDisplayOffers();
  const curated = offers.filter((o) => o.source === "curated").length;
  const auto = offers.length - curated;
  const healthy = note.startsWith("ok:");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Offers</h1>
        <p className="text-muted-foreground mt-1">
          Everything currently served on{" "}
          <a href="/offers" className="underline underline-offset-2" target="_blank">
            /offers
          </a>{" "}
          — {offers.length} live ({curated} curated · {auto} auto from the
          Awin Promotions API)
        </p>
      </div>

      <div
        className={`rounded-xl border p-4 text-sm ${
          healthy
            ? "border-emerald-300/60 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300"
            : "border-amber-300/60 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300"
        }`}
      >
        <span className="font-semibold">Awin Promotions API:</span>{" "}
        <code className="font-mono">{note}</code>
        {healthy
          ? " — feed healthy; new partner promotions appear on the public page within a day."
          : " — the public page is serving the curated fallback only. Curated entries live in src/lib/offers.ts."}
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Merchant</th>
              <th className="px-4 py-3">Offer</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Starts</th>
              <th className="px-4 py-3">Ends</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Link</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((o) => (
              <tr key={o.id} className="border-b last:border-0 align-top">
                <td className="px-4 py-3 font-semibold whitespace-nowrap">
                  {o.merchantName}
                </td>
                <td className="px-4 py-3 max-w-[360px]">
                  <p className="font-medium leading-snug">{o.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {o.description}
                  </p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {o.code ? (
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-bold">
                      {o.code}
                    </code>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs">
                  {OFFER_CATEGORY_LABELS[o.category]}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs tabular-nums">
                  {o.startsAt ?? "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs tabular-nums">
                  {o.endsAt ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={
                      o.source === "awin"
                        ? "border-sky-400/60 text-sky-700 dark:text-sky-300"
                        : "border-emerald-400/60 text-emerald-700 dark:text-emerald-300"
                    }
                  >
                    {o.source === "awin" ? "Auto (API)" : "Curated"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <a
                    href={o.href}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-xs underline underline-offset-2 whitespace-nowrap"
                  >
                    Open tracked link
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
