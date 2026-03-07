"use client";
import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16">
      <AlertTriangle className="size-12 text-destructive mb-4" />
      <h2 className="text-xl font-bold">Dashboard Error</h2>
      <p className="mt-2 text-muted-foreground text-center max-w-md">Something went wrong loading your dashboard.</p>
      <div className="flex gap-3 mt-6">
        <Button onClick={reset}><RefreshCw className="size-4" />Try again</Button>
        <Button variant="outline" asChild><Link href="/"><Home className="size-4" />Home</Link></Button>
      </div>
    </div>
  );
}
