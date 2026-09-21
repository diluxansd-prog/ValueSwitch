import { Suspense } from "react";
import { pageMetadata } from "@/config/seo";
import { HeroSectionServer } from "@/components/home/hero-section-server";
import { LiveStats } from "@/components/home/live-stats";
import { IPhone18Banner } from "@/components/home/iphone-18-banner";
import { CategoryCards } from "@/components/home/category-cards";
import { TrustIndicators } from "@/components/home/trust-indicators";
import { PopularDeals } from "@/components/home/popular-deals";
import { TopOffers } from "@/components/home/top-offers";
import { LatestPhones } from "@/components/home/latest-phones";
import { HowItWorks } from "@/components/home/how-it-works";
import { ProviderLogos } from "@/components/home/provider-logos";
import { SavingOpportunities } from "@/components/home/saving-opportunities";

export const metadata = pageMetadata("/", "Compare Mobile, SIM Only & Broadband Deals", "Compare UK phone contracts, SIM-only plans and broadband deals. Explore iPhone 18 promotions, voucher codes, upfront costs and contract terms. Free to compare.");
export const revalidate = 300;

function GridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <section className="py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mx-auto h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="mx-auto mt-3 h-5 w-full max-w-96 animate-pulse rounded bg-muted" />
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
      <Suspense fallback={<div className="h-[680px] bg-[#0c2528]" />}>
        <HeroSectionServer />
      </Suspense>
      <Suspense fallback={null}>
        <LiveStats />
      </Suspense>
      <Suspense fallback={null}>
        <IPhone18Banner />
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
      <TopOffers />
      <Suspense fallback={<GridSkeleton count={8} />}>
        <LatestPhones />
      </Suspense>
      <Suspense fallback={<GridSkeleton count={3} />}>
        <PopularDeals />
      </Suspense>
      <SavingOpportunities />
      <TrustIndicators />
      <HowItWorks />
      <ProviderLogos />
    </>
  );
}
