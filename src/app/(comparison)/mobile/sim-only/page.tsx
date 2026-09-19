import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { DealCatalogue } from "@/components/comparison/deal-catalogue";
import { getCatalogue } from "@/lib/services/catalogue.service";

export const metadata: Metadata = { title: "SIM-Only Deals — Compare Data, Prices & Plans", description: "Keep your phone and compare SIM-only plans. Explore monthly budgets, unlimited data and flexible contracts from UK providers." };
export const dynamic = "force-dynamic";
const shortcuts = [{ label: "£10 a month or less", href: "/sim-only/under-10" }, { label: "Unlimited data", href: "/sim-only/unlimited" }, { label: "100GB or more", href: "/sim-only/100gb-plus" }, { label: "30-day rolling", href: "/sim-only/30-day-rolling" }];
export default async function SimOnlyPage() {
  const catalogue = await getCatalogue("mobile", "sim-only");
  return <>
    <PageHero eyebrow="SIM-only deals" title="Keep your phone." accent="Rethink your bill." description="A fresh plan without a new handset. Compare data allowances, monthly costs and contract lengths to find your everyday fit." kind="sim"><a href="#sim-deals" className="hero-primary">Find my SIM deal <ArrowRight className="size-4" /></a><Link href="/guides/mobile" className="hero-secondary">Help me choose</Link></PageHero>
    <section id="sim-deals" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16"><div className="mb-7"><p className="section-eyebrow">Less scrolling. More choice.</p><h2 className="mt-2 text-3xl font-semibold">Your plan. Your priorities.</h2></div><nav aria-label="SIM-only shortcuts" className="mb-8 flex flex-wrap gap-2">{shortcuts.map(item => <Link key={item.href} href={item.href} className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950">{item.label}<ArrowRight className="size-3.5" /></Link>)}</nav><DealCatalogue {...catalogue} /></section>
  </>;
}
