import Link from "next/link";
import { Zap } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-green-50/30 px-4 py-12">
      {/* Background decorative elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 size-80 rounded-full bg-gradient-to-br from-[#1a365d]/5 to-[#38a169]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 size-80 rounded-full bg-gradient-to-br from-[#38a169]/5 to-[#1a365d]/5 blur-3xl" />
      </div>

      {/* Logo */}
      <Link
        href="/"
        className="mb-8 flex items-center gap-2.5 transition-opacity hover:opacity-80"
      >
        <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-[#1a365d] to-[#38a169] shadow-lg shadow-[#1a365d]/20">
          <Zap className="size-6 text-white" />
        </div>
        <span className="text-2xl font-bold bg-gradient-to-r from-[#1a365d] to-[#38a169] bg-clip-text text-transparent">
          ValueSwitch
        </span>
      </Link>

      {/* Content */}
      <div className="w-full max-w-md">{children}</div>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} ValueSwitch. All rights reserved.
      </p>
    </div>
  );
}
