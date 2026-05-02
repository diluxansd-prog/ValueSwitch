"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "vs-pwa-prompt-dismissed";
const COOLDOWN_DAYS = 30;

/**
 * Surfaces a small "Install ValueSwitch" prompt when:
 *   - The browser fires the beforeinstallprompt event (Chrome/Edge/Opera)
 *   - The site isn't already installed
 *   - The user hasn't dismissed within the last 30 days
 *
 * iOS Safari doesn't fire the event but we can show a different hint.
 * Both are dismissible. localStorage-based — no cookie consent needed.
 */
export function PwaInstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already installed?
    if (window.matchMedia?.("(display-mode: standalone)").matches) return;

    // Honour cooldown
    try {
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
      if (Date.now() - dismissedAt < COOLDOWN_DAYS * 86_400_000) return;
    } catch {
      return;
    }

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
      // Wait 30 seconds before nagging — let user actually engage with the site
      setTimeout(() => setShow(true), 30_000);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
    setShow(false);
  }

  async function install() {
    if (!evt) return;
    await evt.prompt();
    const { outcome } = await evt.userChoice;
    if (outcome === "accepted") {
      dismiss();
    } else {
      // User declined — wait full cooldown before asking again
      dismiss();
    }
  }

  if (!show || !evt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-2xl border bg-background shadow-2xl print:hidden animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start gap-3 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a365d] to-[#38a169]">
          <Download className="size-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Install ValueSwitch</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quick access to deal alerts and price drops from your home screen.
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              onClick={install}
              className="bg-gradient-to-r from-[#1a365d] to-[#38a169] text-white"
            >
              Install
            </Button>
            <Button size="sm" variant="ghost" onClick={dismiss}>
              Not now
            </Button>
          </div>
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
