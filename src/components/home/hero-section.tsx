"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Smartphone, CardSim, ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" as const },
  }),
};

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#1a365d]">
      <div className="absolute inset-0 opacity-[0.05]">
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 30% 40%, rgba(56, 161, 105, 0.5) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(66, 153, 225, 0.3) 0%, transparent 50%)",
        }} />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">
          {/* Left: Text */}
          <div className="max-w-xl">
            <motion.h1
              className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]"
              initial="hidden" animate="visible" variants={fadeUp} custom={0}
            >
              We help you{" "}
              <span className="text-[#48bb78]">save money</span>
            </motion.h1>

            <motion.p
              className="mt-5 text-lg text-blue-100/80 leading-relaxed"
              initial="hidden" animate="visible" variants={fadeUp} custom={1}
            >
              Compare real mobile phone deals from Vodafone, Talkmobile and Lebara.
              Find the best SIM only and contract deals.
            </motion.p>

            {/* Category Buttons - like Uswitch */}
            <motion.div
              className="mt-8 grid grid-cols-2 gap-3 max-w-sm"
              initial="hidden" animate="visible" variants={fadeUp} custom={2}
            >
              <Link href="/mobile/compare?subcategory=sim-only" className="group">
                <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-3.5 text-white hover:bg-white/20 transition-all">
                  <CardSim className="size-5 shrink-0" />
                  <span className="text-sm font-semibold">SIM Only</span>
                </div>
              </Link>
              <Link href="/mobile/compare?subcategory=contracts" className="group">
                <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-3.5 text-white hover:bg-white/20 transition-all">
                  <Smartphone className="size-5 shrink-0" />
                  <span className="text-sm font-semibold">Mobile phones</span>
                </div>
              </Link>
            </motion.div>

            <motion.div
              className="mt-6"
              initial="hidden" animate="visible" variants={fadeUp} custom={3}
            >
              <Button size="lg" asChild className="bg-[#48bb78] text-white hover:bg-[#38a169] font-semibold px-8 text-base">
                <Link href="/mobile/compare">
                  Compare all deals
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Right: Stats / Trust */}
          <motion.div
            className="hidden lg:flex flex-col gap-4 w-[320px]"
            initial="hidden" animate="visible" variants={fadeUp} custom={3}
          >
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-white">106</p>
                <p className="text-sm text-blue-100/70 mt-1">Real deals to compare</p>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-[#48bb78]">3</p>
                  <p className="text-[10px] text-blue-100/60">Providers</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-[#48bb78]">£4.50</p>
                  <p className="text-[10px] text-blue-100/60">From/mo</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-[#48bb78]">5G</p>
                  <p className="text-[10px] text-blue-100/60">Networks</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 px-5 py-3.5">
              <div className="flex size-10 items-center justify-center rounded-full bg-[#48bb78]/20">
                <Phone className="size-5 text-[#48bb78]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Awin Verified</p>
                <p className="text-xs text-blue-100/60">Official affiliate partner</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
