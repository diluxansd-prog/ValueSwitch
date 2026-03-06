import { Suspense } from "react";
import { HeroSection } from "@/components/home/hero-section";
import { CategoryCards } from "@/components/home/category-cards";
import { TrustIndicators } from "@/components/home/trust-indicators";
import { PopularDeals } from "@/components/home/popular-deals";
import { HowItWorks } from "@/components/home/how-it-works";
import { ProviderLogos } from "@/components/home/provider-logos";
import { Testimonials } from "@/components/home/testimonials";

function PopularDealsSkeleton() {
  return (
    <section className="py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mx-auto h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="mx-auto mt-3 h-5 w-96 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <CategoryCards />
      <TrustIndicators />
      <Suspense fallback={<PopularDealsSkeleton />}>
        <PopularDeals />
      </Suspense>
      <HowItWorks />
      <ProviderLogos />
      <Testimonials />
    </>
  );
}
