import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { OfflineRetry } from "./offline-retry";

export const metadata: Metadata = {
  title: "Offline",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex items-center justify-center size-16 rounded-full bg-muted mb-6">
        <WifiOff className="size-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">You&apos;re offline</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        It looks like you&apos;ve lost your internet connection. Check your connection and try again.
      </p>
      <OfflineRetry />
    </div>
  );
}
