"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function MobileDealToggle() {
  const router = useRouter();

  return (
    <div className="flex gap-4">
      <Button
        size="lg"
        onClick={() => router.push("/mobile/compare?subcategory=sim-only")}
        className="bg-white text-purple-600 hover:bg-white/90 shadow-lg"
      >
        SIM Only Deals
      </Button>
      <Button
        size="lg"
        onClick={() => router.push("/mobile/compare?subcategory=contracts")}
        variant="outline"
        className="border-white/30 text-white hover:bg-white/10"
      >
        Phone Contracts
      </Button>
    </div>
  );
}
