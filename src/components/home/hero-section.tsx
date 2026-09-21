"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Smartphone, CardSim, Recycle, Wifi, SlidersHorizontal } from "lucide-react";
import { SiteSearch } from "@/components/layout/site-search";
import { cn } from "@/lib/utils";

const categories = [
  {
    id: "sim", label: "SIM only", icon: CardSim,
    description: "Keep the phone you love. Find a plan that fits.",
    options: [
      { label: "Show me all SIM-only deals", href: "/mobile/sim-only" },
      { label: "Spend under £10 a month", href: "/sim-only/under-10" },
      { label: "Get unlimited data", href: "/sim-only/unlimited" },
      { label: "Keep it flexible with a rolling plan", href: "/sim-only/30-day-rolling" },
    ],
  },
  {
    id: "phone", label: "New phone", icon: Smartphone,
    description: "Find your next phone with a contract to match.",
    options: [
      { label: "Compare all phone contracts", href: "/mobile/contracts" },
      { label: "Find an iPhone deal", href: "/best/cheapest-iphone-uk" },
      { label: "Find a Samsung Galaxy deal", href: "/best/cheapest-samsung-galaxy-uk" },
      { label: "Find a Google Pixel deal", href: "/best/best-pixel-deal-uk" },
    ],
  },
  {
    id: "broadband", label: "Broadband", icon: Wifi,
    description: "Explore home broadband, then check availability with the provider.",
    options: [
      { label: "Explore broadband deals", href: "/broadband" },
      { label: "Find fibre broadband", href: "/broadband/fibre" },
      { label: "Compare broadband and TV", href: "/broadband/tv-packages" },
    ],
  },
  {
    id: "refurb", label: "Refurbished", icon: Recycle,
    description: "Give a phone a second life. Compare condition, price and warranty.",
    options: [{ label: "Explore refurbished phones", href: "/refurbished" }],
  },
];

export function HeroSection({ stats, hasIPhonePromotion }: { stats?: { deals: number; providers: number }; hasIPhonePromotion?: boolean } = {}) {
  const [categoryId, setCategoryId] = useState("sim");
  const [optionIndex, setOptionIndex] = useState(0);
  const category = categories.find((item) => item.id === categoryId)!;

  return (
    <section className="relative isolate bg-[#0c2528] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-60 size-[700px] rounded-full border border-white/[0.06]" />
        <div className="absolute -right-8 -top-36 size-[500px] rounded-full border border-white/[0.06]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(62,120,95,0.22),transparent_65%)]" />
      </div>
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div>
            <p className="mb-6 flex items-center gap-2.5 text-xs font-semibold tracking-[0.16em] text-emerald-200 uppercase">
              <span className="size-2 rounded-full bg-[#d9ef96]" />
              A little switch. A better deal.
            </p>
            <h1 className="max-w-xl text-[2.75rem] font-semibold leading-[1.08] tracking-[-0.045em] sm:text-6xl lg:text-[4.25rem]">
              Less on bills.<br /><span className="text-[#d9ef96]">More for you.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-200 sm:text-lg">
              Your next mobile or broadband deal starts here. Compare your options, cut through the small print, and find your fit.
            </p>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-200">
              {["Free to compare", "No sign-up needed"].map((item) => (
                <span key={item} className="flex items-center gap-2"><Check aria-hidden="true" className="size-4 text-[#d9ef96]" />{item}</span>
              ))}
            </div>
            <div className="mt-9 max-w-lg">
              <p className="mb-3 text-sm text-slate-300">Already have something in mind?</p>
              <SiteSearch />
            </div>
            {hasIPhonePromotion && <a href="#iphone-promotions" className="group mt-5 inline-flex min-h-11 items-center gap-3 text-sm text-[#edc8ad] hover:text-white"><span className="rounded-md bg-white/10 px-2 py-1 text-[10px] font-semibold tracking-wider uppercase">Featured</span>Explore iPhone 18 Pro Max <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" /></a>}
          </div>
          <div id="deal-finder" className="rounded-3xl border border-white/15 bg-card p-5 text-card-foreground shadow-2xl shadow-black/10 sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Let’s find your fit</p>
                <h2 className="text-2xl font-semibold tracking-tight">What are you looking for?</h2>
              </div>
              <SlidersHorizontal aria-hidden="true" className="hidden size-5 shrink-0 text-muted-foreground sm:block" />
            </div>
            <fieldset>
              <legend className="sr-only">Choose a deal category</legend>
              <div className="grid grid-cols-2 gap-2.5">
                {categories.map((item) => (
                  <label key={item.id} className={cn("relative flex cursor-pointer items-center gap-2.5 rounded-xl border p-3.5 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-emerald-600 has-[:focus-visible]:ring-offset-2", categoryId === item.id ? "border-emerald-700 bg-emerald-50 text-emerald-900 dark:border-emerald-400 dark:bg-emerald-950 dark:text-emerald-100" : "border-border hover:bg-muted")}>
                    <input type="radio" name="deal-category" value={item.id} checked={categoryId === item.id} onChange={() => { setCategoryId(item.id); setOptionIndex(0); }} className="sr-only" />
                    <item.icon aria-hidden="true" className="size-5 shrink-0" />
                    {item.label}
                    {categoryId === item.id && <Check aria-hidden="true" className="ml-auto size-4 shrink-0" />}
                  </label>
                ))}
              </div>
            </fieldset>
            <p className="mt-4 min-h-10 text-sm leading-5 text-muted-foreground" aria-live="polite">{category.description}</p>
            <label htmlFor="deal-priority" className="mt-5 mb-2 block text-sm font-medium">What matters most?</label>
            <select id="deal-priority" value={optionIndex} onChange={(event) => setOptionIndex(Number(event.target.value))} className="h-12 w-full min-w-0 rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600">
              {category.options.map((option, index) => <option key={option.href} value={index}>{option.label}</option>)}
            </select>
            <Link href={category.options[optionIndex].href} className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#d9ef96] px-4 py-3 text-sm font-bold text-[#18382b] transition-colors hover:bg-[#c9e77b]">
              Find my deals <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <p className="mt-4 text-center text-xs text-muted-foreground">Compare here. Complete your purchase with the provider.</p>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-white/15 pt-5 text-xs leading-5 text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <p>We may earn commission when you buy through our links. <Link href="/how-it-works" className="underline underline-offset-4 hover:text-white">How we work</Link></p>
          {stats && stats.deals > 0 && <p className="shrink-0">{stats.deals.toLocaleString("en-GB")} listed deals · {stats.providers} active providers</p>}
        </div>
      </div>
    </section>
  );
}
