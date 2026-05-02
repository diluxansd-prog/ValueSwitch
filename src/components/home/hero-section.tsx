"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Smartphone,
  CardSim,
  Recycle,
  Wifi,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { SiteSearch } from "@/components/layout/site-search";
import { useEffect, useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.55, ease: "easeOut" as const },
  }),
};

const HERO_TILES = [
  { label: "Mobile contracts", href: "/mobile/contracts", icon: Smartphone },
  { label: "SIM only", href: "/mobile/sim-only", icon: CardSim },
  { label: "Refurbished", href: "/refurbished", icon: Recycle },
  { label: "Broadband", href: "/broadband", icon: Wifi },
];

/** Animated number ticker — counts up from 0 to target on mount */
function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const duration = 1100;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return (
    <span className="tabular-nums">
      {val.toLocaleString("en-GB")}
      {suffix}
    </span>
  );
}

interface HeroProps {
  /** Live counters injected from the server component wrapper */
  stats?: {
    deals: number;
    providers: number;
    cheapestMonthly: number;
  };
}

export function HeroSection({ stats }: HeroProps = {}) {
  return (
    <section className="relative overflow-hidden bg-[#08152d] text-white">
      {/* ───────── Layered backdrop ───────── */}
      {/* Base radial gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(56,161,105,0.18), transparent 55%), radial-gradient(ellipse at 80% 60%, rgba(66,153,225,0.15), transparent 50%), linear-gradient(135deg, #0f1f3d 0%, #1a365d 50%, #0c1f3a 100%)",
        }}
      />
      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-[420px] h-[420px] rounded-full bg-emerald-500/15 blur-3xl animate-pulse [animation-duration:8s]" />
        <div className="absolute top-1/3 -right-32 w-[520px] h-[520px] rounded-full bg-blue-500/15 blur-3xl animate-pulse [animation-duration:10s] [animation-delay:2s]" />
        <div className="absolute bottom-0 left-1/3 w-[380px] h-[380px] rounded-full bg-purple-500/10 blur-3xl" />
      </div>
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_440px]">
          {/* ─── Left column: copy + search ─── */}
          <div className="text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            <motion.div
              className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm px-3 py-1.5 mb-6"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={0}
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-xs font-medium text-white">
                {stats ? (
                  <>
                    <CountUp target={stats.deals} /> live deals · updated today
                  </>
                ) : (
                  "Live prices · Awin verified · Updated daily"
                )}
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-[1.05]"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={1}
            >
              Stop overpaying for{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-cyan-300 bg-clip-text text-transparent">
                  mobile &amp; broadband
                </span>
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  height="8"
                  viewBox="0 0 200 8"
                  fill="none"
                >
                  <path
                    d="M0,5 Q50,1 100,4 T200,3"
                    stroke="rgba(72,187,120,0.55)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>
            </motion.h1>

            <motion.p
              className="mt-5 text-lg text-blue-100/80 leading-relaxed max-w-xl mx-auto lg:mx-0"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={2}
            >
              Compare iPhone 17 Pro contracts, refurbished Galaxy S25,
              full-fibre broadband and SIM-only deals — real prices from
              Vodafone, Mozillion, Be Fibre and 8 more.
            </motion.p>

            {/* Search */}
            <motion.div
              className="mt-8"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={3}
            >
              <SiteSearch />
            </motion.div>

            {/* Quick category tiles */}
            <motion.div
              className="mt-6 flex flex-wrap justify-center lg:justify-start gap-2"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={4}
            >
              {HERO_TILES.map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className="group inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white transition-all hover:scale-[1.03]"
                >
                  <t.icon className="size-4 transition-transform group-hover:rotate-[-6deg]" />
                  {t.label}
                </Link>
              ))}
            </motion.div>

            {/* Trust strip */}
            <motion.div
              className="mt-9 flex flex-wrap justify-center lg:justify-start items-center gap-x-5 gap-y-2 text-xs text-blue-100/70"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={5}
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-emerald-300" />
                <span>Companies House #17108611</span>
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-blue-100/40" />
              <span>Affiliate links — never affects deal pricing</span>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-blue-100/40" />
              <span>No data sold</span>
            </motion.div>
          </div>

          {/* ─── Right column: animated price card mockup ─── */}
          <motion.div
            className="relative hidden lg:flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.65, ease: "easeOut" }}
          >
            <PhoneMockup stats={stats} />
          </motion.div>
        </div>
      </div>

      {/* Subtle bottom transition */}
      <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}

/**
 * Floating phone mockup with three animated price-cards stacked beside it,
 * communicating "we find you better deals" without any real photos.
 * Uses pure CSS + Framer Motion — no image assets needed.
 */
function PhoneMockup({
  stats,
}: {
  stats?: { deals: number; providers: number; cheapestMonthly: number };
}) {
  return (
    <div className="relative w-full max-w-[440px] aspect-[5/6]">
      {/* Glow halo */}
      <div className="absolute inset-0 -z-10 rounded-[60px] blur-2xl bg-gradient-to-br from-emerald-400/30 to-blue-500/20" />

      {/* Phone body */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[520px] rounded-[40px] border-[8px] border-slate-900 bg-slate-950 shadow-2xl shadow-black/50 overflow-hidden"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 rounded-b-2xl bg-black z-10" />
        {/* Screen */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f1f3d] via-[#1a365d] to-[#0c1f3a]">
          {/* Status bar */}
          <div className="flex items-center justify-between px-5 pt-3 text-[9px] text-white font-medium">
            <span>9:41</span>
            <span className="flex gap-1 items-center">
              <span>5G</span>
              <span>●●●●○</span>
            </span>
          </div>
          {/* Screen content — Vodafone deal page mock */}
          <div className="px-4 pt-8 space-y-3">
            <div className="text-[8px] text-blue-200 uppercase tracking-wider">
              valueswitch.co.uk
            </div>
            <div className="text-[15px] font-bold text-white leading-tight">
              SIM-only deals
            </div>
            <div className="text-[10px] text-blue-100/70">
              {stats?.providers || 11} retailers · {stats?.deals || 658} live deals
            </div>
            {/* Deal card 1 (highlighted) */}
            <div className="rounded-xl bg-emerald-500/15 border border-emerald-400/40 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[9px] text-blue-100/70">Lebara</div>
                  <div className="text-[11px] font-semibold text-white">
                    100GB · Free EU roaming
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[16px] font-bold text-emerald-300">
                    £{stats?.cheapestMonthly.toFixed(2) || "4.50"}
                  </div>
                  <div className="text-[8px] text-blue-100/70">/mo</div>
                </div>
              </div>
              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/30 px-2 py-0.5 text-[8px] text-emerald-100 font-medium">
                💸 Cheapest right now
              </div>
            </div>
            {/* Deal card 2 */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[9px] text-blue-100/70">Talkmobile</div>
                  <div className="text-[11px] font-semibold text-white">
                    Unlimited 5G data
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[14px] font-bold text-white">£11.95</div>
                  <div className="text-[8px] text-blue-100/70">/mo</div>
                </div>
              </div>
            </div>
            {/* Deal card 3 */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[9px] text-blue-100/70">Vodafone</div>
                  <div className="text-[11px] font-semibold text-white">
                    100GB Xtra plan
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[14px] font-bold text-white">£17.00</div>
                  <div className="text-[8px] text-blue-100/70">/mo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating notification bubble — savings */}
      <motion.div
        className="absolute -left-4 top-12 rounded-2xl bg-white shadow-xl px-4 py-3 max-w-[180px] hidden xl:block"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-emerald-600 text-base">📉</span>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium">Price drop</div>
            <div className="text-xs font-bold text-slate-900">
              Save £{stats ? Math.round(stats.cheapestMonthly * 12 * 0.4) : 60}/yr
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating notification bubble — rating */}
      <motion.div
        className="absolute -right-2 bottom-20 rounded-2xl bg-white shadow-xl px-4 py-3 max-w-[170px] hidden xl:block"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.15, duration: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-amber-100 flex items-center justify-center">
            <Star className="size-4 text-amber-500 fill-amber-500" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-medium">Verified</div>
            <div className="text-xs font-bold text-slate-900">Awin partner</div>
          </div>
        </div>
      </motion.div>

      {/* Floating notification bubble — providers */}
      <motion.div
        className="absolute -left-6 bottom-8 rounded-2xl bg-white shadow-xl px-4 py-3 max-w-[160px] hidden xl:block"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.5 }}
      >
        <div>
          <div className="text-[10px] text-slate-500 font-medium">Compare</div>
          <div className="text-base font-bold text-slate-900">
            {stats?.providers || 11} retailers
          </div>
          <div className="flex -space-x-1.5 mt-1.5">
            {["#E60000", "#00A0E3", "#7B2CBF", "#FF6B00", "#10B981"].map(
              (c, i) => (
                <span
                  key={i}
                  className="size-4 rounded-full ring-2 ring-white"
                  style={{ background: c }}
                />
              )
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
