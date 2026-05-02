import { Suspense } from "react";
import { HeroSectionServer } from "@/components/home/hero-section-server";
import { LiveStats } from "@/components/home/live-stats";
import { CategoryCards } from "@/components/home/category-cards";
import { TrustIndicators } from "@/components/home/trust-indicators";
import { PopularDeals } from "@/components/home/popular-deals";
import { LatestPhones } from "@/components/home/latest-phones";
import { HowItWorks } from "@/components/home/how-it-works";
import { ProviderLogos } from "@/components/home/provider-logos";
import { Testimonials } from "@/components/home/testimonials";

function GridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <section className="py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mx-auto h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="mx-auto mt-3 h-5 w-96 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Suspense fallback={<div className="h-[600px] bg-[#08152d]" />}>
        <HeroSectionServer />
      </Suspense>
      <Suspense fallback={null}>
        <LiveStats />
      </Suspense>
      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          </div>
        }
      >
        <CategoryCards />
      </Suspense>
      <TrustIndicators />
      <Suspense fallback={<GridSkeleton count={8} />}>
        <LatestPhones />
      </Suspense>
      <Suspense fallback={<GridSkeleton count={3} />}>
        <PopularDeals />
      </Suspense>
      <HowItWorks />
      <ProviderLogos />
      <Testimonials />
    </>
  );
}
