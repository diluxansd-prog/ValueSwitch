"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="flex items-center justify-center size-16 rounded-full bg-destructive/10 mb-6">
        <AlertTriangle className="size-8 text-destructive" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-center">
        Something went wrong
      </h1>
      <p className="mt-2 text-muted-foreground text-center max-w-md">
        We encountered an unexpected error. Please try again or return to the
        homepage.
      </p>

      <div className="flex flex-wrap gap-3 mt-8">
        <Button
          onClick={reset}
          className="bg-gradient-to-r from-[#1a365d] to-[#38a169] hover:from-[#2a4a7f] hover:to-[#48bb78] text-white border-0"
        >
          <RefreshCw className="size-4" />
          Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">
            <Home className="size-4" />
            Go home
          </Link>
        </Button>
      </div>
    </div>
  );
}
