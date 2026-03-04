import Link from "next/link";
import { Zap, ShieldCheck, Star, Lock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { footerLinks } from "@/config/navigation";

export function Footer() {
  return (
    <footer className="border-t bg-[#1a365d] text-white">
      {/* Trust badges section */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="flex items-center justify-center size-10 rounded-full bg-white/10">
                <ShieldCheck className="size-5 text-[#38a169]" />
              </div>
              <div>
                <p className="text-sm font-semibold">Ofgem Accredited</p>
                <p className="text-xs text-white/60">
                  Official energy comparison
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <div className="flex items-center justify-center size-10 rounded-full bg-white/10">
                <Star className="size-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">TrustPilot 4.7/5</p>
                <p className="text-xs text-white/60">
                  Based on 12,000+ reviews
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center sm:justify-end">
              <div className="flex items-center justify-center size-10 rounded-full bg-white/10">
                <Lock className="size-5 text-blue-300" />
              </div>
              <div>
                <p className="text-sm font-semibold">Secure & Safe</p>
                <p className="text-xs text-white/60">
                  SSL encrypted & GDPR compliant
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-white/20 to-[#38a169]/50">
                <Zap className="size-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">ValueSwitch</span>
            </Link>
            <p className="text-sm font-medium text-white/80 mb-2">
              Compare. Switch. Save.
            </p>
            <p className="text-sm text-white/60 leading-relaxed">
              The UK&apos;s trusted price comparison service. Compare energy,
              broadband, mobile, insurance and financial products to find the
              best deals and save money.
            </p>
          </div>

          {/* Compare column */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Compare</h3>
            <ul className="space-y-2.5">
              {footerLinks.compare.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company column */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal column */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-white/50">
              &copy; 2026 ValueSwitch. All rights reserved.
            </p>
            <p className="text-xs text-white/40 max-w-xl leading-relaxed">
              ValueSwitch is a trading name of ValueSwitch Ltd, registered in
              England and Wales. Authorised and regulated by the Financial
              Conduct Authority (FCA). Energy comparisons are Ofgem accredited.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
