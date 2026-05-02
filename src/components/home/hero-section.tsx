"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Smartphone, CardSim, Recycle, Wifi, ShieldCheck, Sparkles } from "lucide-react";
import { SiteSearch } from "@/components/layout/site-search";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

const HERO_TILES = [
  { label: "Mobile contracts", href: "/mobile/contracts", icon: Smartphone },
  { label: "SIM only", href: "/mobile/sim-only", icon: CardSim },
  { label: "Refurbished", href: "/refurbished", icon: Recycle },
  { label: "Broadband", href: "/broadband", icon: Wifi },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0f1f3d] via-[#1a365d] to-[#1e2a47]">
      {/* Decorative blobs */}
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <div
          className="absolute -top-32 -left-20 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(72,187,120,0.5), transparent 60%)" }}
        />
        <div
          className="absolute -bottom-40 right-0 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(66,153,225,0.4), transparent 60%)" }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm px-3 py-1.5 mb-6"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
          >
            <Sparkles className="size-3.5 text-emerald-300" />
            <span className="text-xs font-medium text-white">
              Live prices · Awin verified · Updated daily
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.05]"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
          >
            UK's smarter way to{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
              save on mobile &amp; broadband
            </span>
          </motion.h1>

          <motion.p
            className="mt-5 text-lg text-blue-100/80 leading-relaxed max-w-2xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
          >
            Compare iPhone 17 Pro Max contracts, refurbished Galaxy S25, full-fibre broadband and SIM-only deals — all in one place. Real prices from Vodafone, Mozillion, Be Fibre and more.
          </motion.p>

          {/* Search bar — front and centre */}
          <motion.div
            className="mt-9"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
          >
            <SiteSearch />
          </motion.div>

          {/* Quick category tiles */}
          <motion.div
            className="mt-7 flex flex-wrap justify-center gap-2"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={4}
          >
            {HERO_TILES.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white transition-colors"
              >
                <t.icon className="size-4" />
                {t.label}
              </Link>
            ))}
          </motion.div>

          {/* Trust strip */}
          <motion.div
            className="mt-10 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs text-blue-100/70"
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
      </div>
    </section>
  );
}
