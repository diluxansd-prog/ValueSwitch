import { pageMetadata } from "@/config/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { DealCatalogue } from "@/components/comparison/deal-catalogue";
import { getCatalogue } from "@/lib/services/catalogue.service";

export const metadata: Metadata = {
  ...pageMetadata("/mobile/contracts", "Mobile Phone Contracts — Compare Pay-Monthly Deals", "Find your next phone contract. Compare monthly prices, upfront costs and providers for iPhone, Samsung Galaxy, Google Pixel and more."),

};
export const dynamic = "force-dynamic";
export default async function MobileContractsPage() {
  const catalogue = await getCatalogue("mobile", "contract");
  return <>
    <PageHero eyebrow="Phone contracts" title="New phone feeling." accent="Better deal thinking." description="Find your next iPhone, Galaxy or Pixel. Compare the monthly price, upfront cost and commitment, all in one place." kind="phone"><a href="#contracts" className="hero-primary">Explore contracts <ArrowRight className="size-4" /></a><Link href="/mobile/sim-only" className="hero-secondary">Just need a SIM?</Link></PageHero>
    <section id="contracts" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="section-eyebrow">Make your upgrade count</p><h2 className="mt-2 text-3xl font-semibold">Find a contract that fits.</h2></div><Link href="/mobile/compare?subcategory=contract" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">Advanced comparison <ArrowRight className="size-4" /></Link></div><DealCatalogue {...catalogue} /></section>
  </>;
}
