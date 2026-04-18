"use client";

import { useEffect, useState } from "react";
import { X, Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const DISMISS_KEY = "vs-exit-intent-dismissed";
const SHOWN_KEY = "vs-exit-intent-shown-at";
// Don't annoy the same user every visit — 7-day cooldown
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export function ExitIntentPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Respect previous dismissal
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY);
      if (dismissed) return;
      const shownAt = Number(localStorage.getItem(SHOWN_KEY) || 0);
      if (Date.now() - shownAt < COOLDOWN_MS) return;
    } catch {
      // localStorage blocked (private mode) — just don't show
      return;
    }

    let shown = false;
    const show = () => {
      if (shown) return;
      shown = true;
      setOpen(true);
      try {
        localStorage.setItem(SHOWN_KEY, String(Date.now()));
      } catch {
        // ignore
      }
    };

    // Desktop: trigger on mouse leave toward top of viewport
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) show();
    };
    document.addEventListener("mouseleave", onMouseLeave);

    // Mobile: scroll depth proxy — if user scrolls past 60% they've engaged
    // Show only when they scroll *back up* 200px (proxy for "leaving")
    let maxScroll = 0;
    const onScroll = () => {
      const y = window.scrollY;
      const pct = (y + window.innerHeight) / document.body.scrollHeight;
      if (pct > 0.6) maxScroll = Math.max(maxScroll, y);
      if (maxScroll && y < maxScroll - 200 && pct < 0.5) show();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Fallback: if user idles on same page for 45s, show once
    const idle = setTimeout(show, 45_000);

    return () => {
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", onScroll);
      clearTimeout(idle);
    };
  }, []);

  const dismiss = (permanent = false) => {
    setOpen(false);
    if (permanent) {
      try {
        localStorage.setItem(DISMISS_KEY, "1");
      } catch {
        // ignore
      }
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to subscribe");
      }
      setSuccess(true);
      try {
        localStorage.setItem(DISMISS_KEY, "1");
      } catch {
        // ignore
      }
      setTimeout(() => setOpen(false), 2200);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
    setSubmitting(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 print:hidden">
      <div className="relative w-full max-w-md mx-4 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden">
        {/* Close */}
        <button
          onClick={() => dismiss(true)}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 rounded-full p-1.5 text-muted-foreground hover:bg-muted transition-colors"
        >
          <X className="size-4" />
        </button>

        {/* Gradient header */}
        <div className="bg-gradient-to-br from-[#1a365d] to-[#38a169] px-6 py-8 text-white text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Bell className="size-6" />
          </div>
          <h2 className="text-xl font-bold">Wait — before you go!</h2>
          <p className="mt-1 text-sm text-white/90">
            Get price-drop alerts when deals get cheaper
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {success ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                <Check className="size-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="font-semibold">You&apos;re on the list!</p>
              <p className="text-sm text-muted-foreground mt-1">
                We&apos;ll send you the best deals each week.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Join thousands of UK shoppers. One email per week with the
                best phone and SIM deals we&apos;ve found. Unsubscribe anytime.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  type="email"
                  placeholder="your@email.co.uk"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  disabled={submitting}
                  autoFocus
                />
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 bg-gradient-to-r from-[#1a365d] to-[#38a169] text-white hover:from-[#2a4a7f] hover:to-[#48bb78] border-0"
                >
                  {submitting ? "Subscribing..." : "🔔 Notify me of deals"}
                </Button>
              </form>

              <button
                type="button"
                onClick={() => dismiss(true)}
                className="mt-3 w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                No thanks, don&apos;t show again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
