import { Zap } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="relative">
        <div className="flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-[#1a365d] to-[#38a169] animate-pulse">
          <Zap className="size-8 text-white" />
        </div>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1a365d] to-[#38a169] animate-ping opacity-20" />
      </div>
      <p className="mt-6 text-sm text-muted-foreground animate-pulse">
        Loading...
      </p>
    </div>
  );
}
