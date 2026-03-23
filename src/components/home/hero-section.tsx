"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Shield, Smartphone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { comingSoonCategories } from "@/config/categories";

const trustBadges = [
  { icon: Star, label: "Real Deals" },
  { icon: Shield, label: "Trusted Partners" },
  { icon: Smartphone, label: "Awin Verified" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" as const },
  }),
};

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1a365d] via-[#1e3a5f] to-slate-800">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-[0.07]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(56, 161, 105, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(66, 153, 225, 0.3) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(72, 187, 120, 0.2) 0%, transparent 50%)",
          }}
        />
      </div>
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:py-32">
        <div className="flex flex-col items-center text-center">
          {/* Trust badges */}
          <motion.div
            className="mb-6 sm:mb-8 flex flex-wrap items-center justify-center gap-2 sm:gap-4 lg:gap-6"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
          >
            {trustBadges.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm sm:text-sm"
              >
                <badge.icon className="size-3.5 text-[#48bb78]" />
                <span>{badge.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="mb-4 sm:mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-6xl"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
          >
            Compare Mobile Deals.{" "}
            <span className="text-[#48bb78]">Save.</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="mb-8 sm:mb-10 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base lg:text-lg"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
          >
            Compare real phone contracts and SIM-only deals from Vodafone, Talkmobile, TTfone, and Lebara.
            Real prices, real affiliate links, no fake data.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="mb-10 flex flex-col sm:flex-row items-center gap-4"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
          >
            <Button
              size="lg"
              asChild
              className="bg-gradient-to-r from-[#38a169] to-[#48bb78] text-white hover:from-[#2f8a5a] hover:to-[#38a169] px-8"
            >
              <Link href="/mobile">
                <Smartphone className="size-5" />
                Compare Mobile Deals
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Link href="/mobile/contracts">
                Browse Phone Contracts
              </Link>
            </Button>
          </motion.div>

          {/* Coming Soon Categories */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={4}
          >
            <span className="text-xs text-white/50 mr-1">Coming soon:</span>
            {comingSoonCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.slug}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/40"
                >
                  <Icon className="size-3.5" />
                  <span>{category.name}</span>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 60V30C240 10 480 0 720 10C960 20 1200 40 1440 30V60H0Z"
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
}
