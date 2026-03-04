import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  Target,
  Eye,
  Heart,
  Shield,
  Zap,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "About ValueSwitch",
  description:
    "Learn about ValueSwitch, the UK's trusted price comparison service. Our mission is to help millions of households and businesses save money by switching.",
};

const stats = [
  { value: "2.7M+", label: "Switches Made" },
  { value: "38+", label: "Trusted Providers" },
  { value: "6+", label: "Categories" },
  { value: "97%", label: "Customer Satisfaction" },
];

const values = [
  {
    icon: Shield,
    title: "Trust & Transparency",
    description:
      "We provide honest, unbiased comparisons. Our results are never influenced by commercial relationships. You see the full picture so you can make confident decisions.",
  },
  {
    icon: Users,
    title: "Customer First",
    description:
      "Everything we do starts with the customer. We design our service around your needs, making it simple and stress-free to compare and switch.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description:
      "We continuously invest in technology to make comparing faster, smarter and more personalised. Our tools evolve to serve you better every day.",
  },
  {
    icon: Heart,
    title: "Fairness",
    description:
      "We believe everyone deserves access to the best deals. Our service is free for consumers, and we fight to ensure fair pricing across the market.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a365d] to-[#2a4a7f] py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            About ValueSwitch
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-xl leading-relaxed text-blue-100">
            We are on a mission to help every UK household and business save
            money by making it effortless to compare and switch providers.
          </p>
        </div>
      </section>

      {/* Company Story */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Our Story</h2>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
            <p>
              ValueSwitch was founded with a simple belief: comparing providers
              should be easy, transparent and free. Too many people in the UK
              were overpaying for essential services simply because switching
              felt complicated and time-consuming.
            </p>
            <p>
              We set out to change that. By building a platform that brings
              together the UK&apos;s leading providers across energy, broadband,
              mobile, insurance and finance, we make it possible to compare deals
              side by side in minutes, not hours.
            </p>
            <p>
              Since then, we have helped millions of customers find better deals,
              saving them hundreds of pounds each year. But we are not done. We
              continue to expand our categories, improve our technology and fight
              for fairer prices for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="border-2 border-[#1a365d]/10">
              <CardContent className="p-8">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-[#1a365d]/10 text-[#1a365d] dark:bg-[#1a365d]/20 dark:text-blue-400">
                  <Target className="size-6" />
                </div>
                <h3 className="text-2xl font-bold">Our Mission</h3>
                <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
                  To empower every UK household and business to take control of
                  their bills by providing free, impartial and comprehensive
                  price comparison across all essential services.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-[#38a169]/10">
              <CardContent className="p-8">
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-[#38a169]/10 text-[#38a169] dark:bg-[#38a169]/20 dark:text-emerald-400">
                  <Eye className="size-6" />
                </div>
                <h3 className="text-2xl font-bold">Our Vision</h3>
                <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
                  A world where no one overpays for essential services. We
                  envision a transparent market where consumers have the
                  information and tools they need to always get the best value.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
            ValueSwitch in Numbers
          </h2>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="bg-gradient-to-r from-[#1a365d] to-[#38a169] bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Values */}
      <section className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Our Values</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <Card
                key={value.title}
                className="border border-border/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a365d]/10 to-[#38a169]/10 text-[#1a365d] dark:text-blue-400">
                    <value.icon className="size-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to Start Saving?
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Join millions of people who have already switched and saved with
            ValueSwitch.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-[#1a365d] to-[#38a169] text-white hover:from-[#2a4a7f] hover:to-[#48bb78]"
            >
              <Link href="/">
                Start Comparing
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/how-it-works">How It Works</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
