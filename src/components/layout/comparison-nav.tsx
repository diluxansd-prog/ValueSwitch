"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Smartphone, CardSim, Wifi, Recycle, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { label: "Phone contracts", href: "/mobile/contracts", icon: Smartphone },
  { label: "SIM only", href: "/mobile/sim-only", icon: CardSim },
  { label: "Broadband", href: "/broadband", icon: Wifi },
  { label: "Refurbished", href: "/refurbished", icon: Recycle },
];

export function ComparisonNav() {
  const pathname = usePathname();
  return <nav aria-label="Compare categories" className="border-b bg-card"><div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 sm:px-6">{links.map(({ label, href, icon: Icon }) => {
    const active = pathname === href || (href === "/broadband" && pathname.startsWith("/broadband/")) || (href === "/mobile/sim-only" && pathname.startsWith("/sim-only/"));
    return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cn("flex shrink-0 items-center gap-2 border-b-2 px-3 py-4 text-xs font-medium transition-colors sm:px-4 sm:text-sm", active ? "border-emerald-700 text-emerald-800 dark:border-emerald-400 dark:text-emerald-300" : "border-transparent text-muted-foreground hover:text-foreground")}><Icon aria-hidden="true" className="size-4" />{label}</Link>;
  })}<Link href="/guides" className="ml-auto hidden shrink-0 items-center gap-1 py-4 pl-4 text-xs text-muted-foreground hover:text-foreground md:flex">Need a hand? <ArrowUpRight aria-hidden="true" className="size-3" /></Link></div></nav>;
}
