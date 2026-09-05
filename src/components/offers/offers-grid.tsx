"use client";

import { useMemo, useState } from "react";
import { Check, Clock, Copy, ExternalLink, Scissors, Tag } from "lucide-react";

/**
 * Client-side coupon grid for /offers — category filter tabs plus
 * ticket-style cards with a perforated "stub" holding the code and CTA.
 * Offers arrive fully resolved from the server (href precomputed), so
 * this component holds zero affiliate logic.
 */

export interface OfferCard {
  id: string;
  merchantName: string;
  merchantSlug: string;
  title: string;
  description: string;
  code?: string;
  endsAt?: string; // pre-formatted display date, e.g. "15 Sept 2026"
  category: string;
  categoryLabel: string;
  badge: string;
  href: string;
  brandFrom: string;
  brandTo: string;
}

function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore — private mode / older browsers
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title="Copy code"
      aria-label={`Copy code ${code}`}
      className="group/code inline-flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-emerald-400/70 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors px-2.5 py-1.5 text-xs font-mono font-bold"
    >
      <Tag className="size-3 shrink-0" />
      <span className="truncate">{code}</span>
      {copied ? (
        <Check className="size-3 shrink-0 text-emerald-600" />
      ) : (
        <Copy className="size-3 shrink-0 opacity-60 group-hover/code:opacity-100" />
      )}
    </button>
  );
}

export function OffersGrid({ offers }: { offers: OfferCard[] }) {
  const [active, setActive] = useState<string>("all");

  const tabs = useMemo(() => {
    const seen = new Map<string, string>();
    for (const o of offers) {
      if (!seen.has(o.category)) seen.set(o.category, o.categoryLabel);
    }
    return [
      { key: "all", label: "All offers", count: offers.length },
      ...[...seen.entries()].map(([key, label]) => ({
        key,
        label,
        count: offers.filter((o) => o.category === key).length,
      })),
    ];
  }, [offers]);

  const visible =
    active === "all" ? offers : offers.filter((o) => o.category === active);

  return (
    <div>
      {/* Filter tabs */}
      <div
        role="tablist"
        aria-label="Filter offers by category"
        className="flex flex-wrap gap-2 mb-8"
      >
        {tabs.map((t) => {
          const selected = active === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(t.key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                selected
                  ? "bg-gradient-to-r from-[#1a365d] to-[#38a169] text-white shadow-md"
                  : "bg-white dark:bg-slate-900/70 border border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                  selected
                    ? "bg-white/20"
                    : "bg-slate-100 dark:bg-slate-800 text-muted-foreground"
                }`}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Coupon tickets */}
      <div className="grid gap-5 md:grid-cols-2">
        {visible.map((offer) => {
          const grad = `linear-gradient(135deg, ${offer.brandFrom}, ${offer.brandTo})`;
          return (
            <article
              key={offer.id}
              id={offer.id}
              className="group relative rounded-2xl bg-white dark:bg-slate-900/80 border border-border/60 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col sm:flex-row overflow-hidden"
            >
              {/* Brand rail */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1.5"
                style={{ background: grad }}
              />

              {/* Main body */}
              <div className="flex-1 min-w-0 p-5 pl-6 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full shrink-0"
                    style={{ background: grad }}
                  />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {offer.merchantName}
                  </p>
                  {offer.endsAt && (
                    <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 font-semibold whitespace-nowrap">
                      <Clock className="size-3" />
                      Ends {offer.endsAt}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold leading-snug">
                  {offer.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                  {offer.description}
                </p>
              </div>

              {/* Perforation */}
              <div className="relative shrink-0 sm:w-0 h-0 sm:h-auto mx-5 sm:mx-0">
                <div className="absolute inset-x-0 sm:inset-x-auto sm:inset-y-0 sm:left-0 border-t-2 sm:border-t-0 sm:border-l-2 border-dashed border-border/70" />
                {/* Punch holes — match the section background */}
                <div className="hidden sm:block absolute -top-3 -left-3 size-6 rounded-full bg-slate-50 dark:bg-slate-950 border-b border-border/60" />
                <div className="hidden sm:block absolute -bottom-3 -left-3 size-6 rounded-full bg-slate-50 dark:bg-slate-950 border-t border-border/60" />
                <Scissors className="hidden sm:block absolute top-1/2 -translate-y-1/2 -left-2 size-4 text-muted-foreground/40 rotate-90" />
              </div>

              {/* Stub */}
              <div
                className="shrink-0 sm:w-[168px] p-5 flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-3 text-center"
                style={{
                  background: `linear-gradient(135deg, ${offer.brandFrom}0f, ${offer.brandTo}1a)`,
                }}
              >
                <span
                  className="rounded-lg px-3 py-1.5 text-sm font-extrabold text-white shadow-sm whitespace-nowrap"
                  style={{ background: grad }}
                >
                  {offer.badge}
                </span>
                <div className="flex flex-row sm:flex-col items-center gap-2 sm:w-full">
                  {offer.code && (
                    <div className="w-[130px] sm:w-full">
                      <CopyCode code={offer.code} />
                    </div>
                  )}
                  <a
                    href={offer.href}
                    target="_blank"
                    rel="noopener noreferrer nofollow sponsored"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#1a365d] to-[#38a169] hover:from-[#2a4a7f] hover:to-[#48bb78] text-white px-4 py-1.5 text-xs font-bold shadow-md transition-colors whitespace-nowrap sm:w-full"
                  >
                    Get deal
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
