import Link from "next/link";
import { ArrowRight, Check, Smartphone, CardSim, Wifi, Recycle, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

const icons = { phone: Smartphone, sim: CardSim, broadband: Wifi, refurb: Recycle, general: Sparkles };

export function PageHero({ eyebrow, title, accent, description, kind = "general", children }: {
  eyebrow: string; title: string; accent?: string; description: string;
  kind?: keyof typeof icons; children?: ReactNode;
}) {
  const Icon = icons[kind];
  return (
    <section className="premium-hero">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-white/60"><Link href="/" className="hover:text-white">Home</Link><ArrowRight aria-hidden="true" className="size-3" /><span aria-current="page" className="text-white/85">{eyebrow}</span></nav>
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_280px]">
          <div className="relative z-10">
            <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#d9ef96]"><span className="size-1.5 rounded-full bg-current" />{eyebrow}</p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-5xl lg:text-6xl">{title}{accent && <span className="mt-1 block text-[#d9ef96]">{accent}</span>}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">{description}</p>
            {children && <div className="mt-7 flex flex-wrap gap-3">{children}</div>}
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/65"><span className="flex items-center gap-1.5"><Check className="size-3.5 text-[#d9ef96]" />Free to compare</span><span className="flex items-center gap-1.5"><Check className="size-3.5 text-[#d9ef96]" />Buy with the provider</span></div>
          </div>
          <div aria-hidden="true" className="hero-object hidden lg:flex">
            <div className="hero-object-orbit" />
            <div className="hero-object-card"><span className="mb-8 text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">A better connection</span><Icon className="size-20 stroke-[1] text-[#d9ef96]" /><span className="mt-8 text-sm font-medium text-white/90">Compare. Choose. Switch.</span></div>
            <span className="hero-object-check"><Check className="size-5" /></span>
          </div>
        </div>
      </div>
    </section>
  );
}
