import { pageMetadata } from "@/config/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Smartphone, CardSim, Recycle } from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { PopularDeals } from "@/components/home/popular-deals";
import { SavingOpportunities } from "@/components/home/saving-opportunities";

export const metadata: Metadata = {
  ...pageMetadata("/mobile", "Compare Mobile Deals — Phone Contracts & SIM Only", "Explore mobile contracts, SIM-only plans and refurbished phones. Compare prices, providers and contract terms with ValueSwitch."),

};
export const dynamic = "force-dynamic";
const options = [
  { icon: Smartphone, title: "A new phone", description: "Find your next handset with a monthly plan to match.", href: "/mobile/contracts", label: "Compare phone contracts", color: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  { icon: CardSim, title: "A better SIM plan", description: "Keep your phone and compare data, price and flexibility.", href: "/mobile/sim-only", label: "Explore SIM-only deals", color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
  { icon: Recycle, title: "A second-life phone", description: "Explore refurbished handsets and check condition and warranty.", href: "/refurbished", label: "Browse refurbished phones", color: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300" },
];
export default function MobilePage() {
  return <>
    <PageHero eyebrow="Mobile, made simple" title="Your next connection." accent="Your kind of deal." description="New phone or same favourite handset? Find a plan that fits your everyday, with the details you need to choose confidently." kind="phone"><Link href="/mobile/contracts" className="hero-primary">Find a phone contract <ArrowRight className="size-4" /></Link><Link href="/mobile/sim-only" className="hero-secondary">Keep my phone</Link></PageHero>
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6"><div className="mb-8"><p className="section-eyebrow">Start with what you need</p><h2 className="mt-2 text-3xl font-semibold">Three ways to make your next move.</h2></div><div className="grid gap-5 md:grid-cols-3">{options.map(item => <Link key={item.href} href={item.href} className="group flex flex-col rounded-3xl border bg-card p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"><div className={`mb-7 grid size-14 place-items-center rounded-2xl ${item.color}`}><item.icon className="size-7" /></div><h3 className="text-xl font-semibold">{item.title}</h3><p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{item.description}</p><span className="mt-7 flex items-center justify-between gap-2 border-t pt-5 text-sm font-semibold">{item.label}<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span></Link>)}</div></section>
    <PopularDeals /><SavingOpportunities />
  </>;
}
