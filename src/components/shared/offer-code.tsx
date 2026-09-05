"use client";

import { useState } from "react";
import { Check, Copy, Tag } from "lucide-react";

/**
 * Copyable voucher-code chip used on the /offers page.
 * Falls back gracefully when the Clipboard API is unavailable.
 */
export function OfferCode({ code }: { code: string }) {
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
      className="inline-flex items-center gap-1.5 rounded-full border-2 border-dashed border-emerald-400/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors px-3 py-1 text-xs font-mono font-bold"
    >
      <Tag className="size-3" />
      <span>{code}</span>
      {copied ? (
        <Check className="size-3 text-emerald-600" />
      ) : (
        <Copy className="size-3 opacity-60" />
      )}
    </button>
  );
}
