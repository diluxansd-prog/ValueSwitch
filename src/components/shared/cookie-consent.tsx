"use client";

import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  function accept() {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem("cookie-consent", "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] border-t bg-background/95 p-4 shadow-lg backdrop-blur-md sm:p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 size-5 shrink-0 text-[#38a169]" />
          <div>
            <p className="text-sm font-medium text-foreground">We use cookies</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              We use essential cookies to make our site work. With your consent, we may also use non-essential cookies to improve your experience.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={decline} className="text-xs">
            Decline
          </Button>
          <Button
            size="sm"
            onClick={accept}
            className="bg-gradient-to-r from-[#1a365d] to-[#38a169] text-white text-xs hover:from-[#2a4a7f] hover:to-[#48bb78]"
          >
            Accept all
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 sm:hidden"
            onClick={decline}
            aria-label="Close"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
