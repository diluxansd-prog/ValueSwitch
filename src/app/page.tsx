import { HeroSection } from "@/components/home/hero-section";
import { CategoryCards } from "@/components/home/category-cards";
import { TrustIndicators } from "@/components/home/trust-indicators";
import { PopularDeals } from "@/components/home/popular-deals";
import { HowItWorks } from "@/components/home/how-it-works";
import { ProviderLogos } from "@/components/home/provider-logos";
import { Testimonials } from "@/components/home/testimonials";

export default function Home() {
  return (
    <>
      <HeroSection />
      <CategoryCards />
      <TrustIndicators />
      <PopularDeals />
      <HowItWorks />
      <ProviderLogos />
      <Testimonials />
    </>
  );
}
