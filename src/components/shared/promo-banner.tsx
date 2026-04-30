"use client";

import { useEffect, useState } from "react";
import { X, Copy, Check, Tag } from "lucide-react";

interface Promo {
  id: string;
  title: string;
  subtitle: string | null;
  code: string | null;
  ctaLabel: string;
  ctaUrl: string;
  emoji: string | null;
  bgGradient: string | null;
  endsAt: string; // ISO
}

interface Props {
  promos: Promo[];
}

const DISMISS_KEY_PREFIX = "vs-promo-dismissed-";

function timeLeft(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "ending now";
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  if (days > 0) return `${days}d ${hours}h left`;
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

export function PromoBanner({ promos }: Props) {
  // Find the highest-priority promo not dismissed by the user.
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [tick, setTick] = useState(0); // re-render every minute for countdown

  useEffect(() => {
    if (typeof window === "undefined") return;
    let dismissed: Set<string>;
    try {
      dismissed = new Set(
        promos
          .map((p) => p.id)
          .filter((id) => localStorage.getItem(DISMISS_KEY_PREFIX + id))
      );
    } catch {
      dismissed = new Set();
    }
    const idx = promos.findIndex((p) => !dismissed.has(p.id));
    setActiveIdx(idx >= 0 ? idx : null);
  }, [promos]);

  // Re-render every 60s so the "2d 4h left" string ticks down.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  if (activeIdx === null || activeIdx < 0 || !promos[activeIdx]) return null;
  const promo = promos[activeIdx];

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY_PREFIX + promo.id, "1");
    } catch {
      // ignore — private mode
    }
    setActiveIdx(null);
  }

  async function copyCode() {
    if (!promo.code) return;
    try {
      await navigator.clipboard.writeText(promo.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  const gradient =
    promo.bgGradient || "from-[#1a365d] via-[#2a4a7f] to-[#38a169]";
  // Inline className safelist hint — bgGradient values are admin-set,
  // Tailwind JIT covers our defaults. Custom values still work via the
  // string template below.
  void tick; // keep tick referenced so React re-runs the effect

  return (
    <aside
      role="region"
      aria-label="Promotional banner"
      className={`relative overflow-hidden bg-gradient-to-r ${gradient} text-white print:hidden`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 py-2.5 sm:py-3 text-sm">
          {/* Emoji / icon */}
          <span className="text-lg sm:text-xl shrink-0" aria-hidden>
            {promo.emoji || "🎉"}
          </span>

          {/* Title + subtitle */}
          <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:gap-3">
            <p className="font-semibold leading-tight truncate">
              {promo.title}
            </p>
            {promo.subtitle && (
              <p className="text-white/80 text-xs sm:text-sm leading-tight truncate">
                {promo.subtitle}
              </p>
            )}
          </div>

          {/* Code chip (copyable) */}
          {promo.code && (
            <button
              type="button"
              onClick={copyCode}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 transition-colors px-3 py-1 text-xs font-mono font-semibold backdrop-blur-sm"
              title="Copy code"
              aria-label={`Copy code ${promo.code}`}
            >
              <Tag className="size-3" />
              <span>{promo.code}</span>
              {copied ? (
                <Check className="size-3 text-emerald-200" />
              ) : (
                <Copy className="size-3 opacity-70" />
              )}
            </button>
          )}

          {/* Countdown */}
          <span className="hidden md:inline-block text-xs text-white/70 tabular-nums whitespace-nowrap shrink-0">
            ⏰ {timeLeft(promo.endsAt)}
          </span>

          {/* CTA */}
          <a
            href={promo.ctaUrl}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="inline-flex items-center rounded-full bg-white text-[#1a365d] hover:bg-white/95 transition-colors px-3 sm:px-4 py-1 text-xs sm:text-sm font-bold shrink-0 shadow-sm"
          >
            {promo.ctaLabel}
            <span className="ml-1.5" aria-hidden>
              →
            </span>
          </a>

          {/* Dismiss */}
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss promo banner"
            className="shrink-0 rounded-full p-1 hover:bg-white/15 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
