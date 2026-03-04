"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Shield, MessageSquare } from "lucide-react";
import { PostcodeChecker } from "@/components/shared/postcode-checker";
import { categories } from "@/config/categories";

const trustBadges = [
  { icon: Star, label: "4.7\u2605 TrustPilot" },
  { icon: Shield, label: "Ofgem Accredited" },
  { icon: MessageSquare, label: "35,000+ reviews" },
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
  const router = useRouter();

  function handlePostcodeSubmit(postcode: string) {
    router.push(`/energy?postcode=${encodeURIComponent(postcode)}`);
  }

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

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
        <div className="flex flex-col items-center text-center">
          {/* Trust badges */}
          <motion.div
            className="mb-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6"
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
            className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
          >
            Compare. Switch.{" "}
            <span className="text-[#48bb78]">Save.</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="mb-10 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
          >
            Find the best deals on energy, broadband, mobile, insurance and
            more. Free, impartial comparison for UK households.
          </motion.p>

          {/* Postcode Checker */}
          <motion.div
            className="mb-10 w-full max-w-lg"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
          >
            <PostcodeChecker
              onSubmit={handlePostcodeSubmit}
              placeholder="Enter your postcode to start"
              buttonText="Compare deals"
            />
          </motion.div>

          {/* Category quick-links */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={4}
          >
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.slug}
                  href={`/${category.slug}`}
                  className="group flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm transition-all hover:border-[#48bb78]/40 hover:bg-white/10 hover:text-white"
                >
                  <Icon className="size-4 transition-colors group-hover:text-[#48bb78]" />
                  <span>{category.name}</span>
                </Link>
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
