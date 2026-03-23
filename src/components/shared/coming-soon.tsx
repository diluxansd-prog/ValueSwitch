import Link from "next/link";
import { Clock, ArrowRight, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CategoryConfig } from "@/config/categories";

export function ComingSoon({ category }: { category: CategoryConfig }) {
  const Icon = category.icon;

  return (
    <div className="min-h-screen">
      <section
        className={`relative overflow-hidden bg-gradient-to-br ${category.gradient} py-20`}
      >
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Icon className="size-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {category.name} Comparison
          </h1>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-6 py-3 text-white backdrop-blur-sm">
            <Clock className="size-5" />
            <span className="text-lg font-semibold">Coming Soon</span>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
            We&apos;re working with {category.name.toLowerCase()} providers to bring you
            real, verified deals. No fake data — only real prices from trusted partners.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-4">Want to be notified?</h2>
        <p className="text-muted-foreground mb-8">
          We&apos;ll let you know when {category.name.toLowerCase()} deals go live.
          In the meantime, check out our live mobile deals.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild className="bg-gradient-to-r from-[#1a365d] to-[#38a169] text-white">
            <Link href="/mobile">
              <Smartphone className="size-5" />
              Browse Mobile Deals
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
