"use client";

import { Button } from "@/components/ui/button";

export function OfflineRetry() {
  return (
    <Button
      onClick={() => window.location.reload()}
      className="mt-6 bg-gradient-to-r from-[#1a365d] to-[#38a169] text-white hover:from-[#2a4a7f] hover:to-[#48bb78]"
    >
      Try again
    </Button>
  );
}
