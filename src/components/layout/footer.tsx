import Link from "next/link";
import { Zap, ShieldCheck, Star, Lock, Phone, Mail, MapPin } from "lucide-react";
import { Newsletter } from "@/components/shared/newsletter";
import { footerLinks } from "@/config/navigation";
import { COMPANY } from "@/lib/constants";

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

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
                <p className="text-sm font-semibold">Awin Affiliate Partner</p>
                <p className="text-xs text-white/60">
                  Verified real deals
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
                  Based on 35,000+ reviews
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
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-white/20 to-[#38a169]/50">
                <Zap className="size-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">ValueSwitch</span>
            </Link>
            <p className="text-sm font-medium text-white/80 mb-2">
              Compare. Switch. Save.
            </p>
            <p className="text-sm text-white/60 leading-relaxed mb-6">
              Compare real mobile phone deals from trusted UK networks.
              Real prices from Vodafone, Talkmobile, TTfone and Lebara.
              More categories coming soon.
            </p>

            <Newsletter />

            {/* Contact info */}
            <div className="mt-6 space-y-2.5 text-sm text-white/70">
              <a
                href={`tel:${COMPANY.phone.tel}`}
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Phone className="size-4 text-[#48bb78]" />
                <span>{COMPANY.phone.display}</span>
              </a>
              <a
                href={`mailto:${COMPANY.email.support}`}
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Mail className="size-4 text-[#48bb78]" />
                <span>{COMPANY.email.support}</span>
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="size-4 text-[#48bb78] shrink-0 mt-0.5" />
                <span className="text-xs leading-relaxed">
                  {COMPANY.address.street}, {COMPANY.address.city},{" "}
                  {COMPANY.address.country}, {COMPANY.address.postcode}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://twitter.com/valueswitch"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                aria-label="Follow us on X (Twitter)"
              >
                <TwitterIcon className="size-4" />
              </a>
              <a
                href="https://facebook.com/valueswitch"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                aria-label="Follow us on Facebook"
              >
                <FacebookIcon className="size-4" />
              </a>
              <a
                href="https://linkedin.com/company/valueswitch"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                aria-label="Follow us on LinkedIn"
              >
                <LinkedInIcon className="size-4" />
              </a>
            </div>
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 space-y-3">
          <p className="text-xs text-white/40 max-w-4xl leading-relaxed">
            {COMPANY.legalName} is a company registered in England and Wales.
            Company number{" "}
            <span className="font-mono text-white/60">
              {COMPANY.companyNumber}
            </span>
            . Registered office: {COMPANY.address.full}. ValueSwitch is an Awin
            affiliate partner. We earn commission when you click through to
            providers. This does not affect the deals shown or the prices you
            pay.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-white/5">
            <p className="text-xs text-white/50">
              &copy; 2026 {COMPANY.legalName}. All rights reserved.
            </p>
            <p className="text-xs text-white/40">
              Company No: {COMPANY.companyNumber} · {COMPANY.address.postcode}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
