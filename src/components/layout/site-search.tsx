"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useId } from "react";
import Link from "next/link";
import { Search, Smartphone, CardSim, Wifi, Recycle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Suggestion {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
}

const QUICK_LINKS: Suggestion[] = [
  { label: "Mobile contracts", href: "/mobile/contracts", icon: Smartphone, hint: "Find your next phone" },
  { label: "SIM-only deals", href: "/mobile/sim-only", icon: CardSim, hint: "Keep your phone" },
  { label: "Refurbished phones", href: "/refurbished", icon: Recycle, hint: "Give a phone a second life" },
  { label: "Broadband", href: "/broadband", icon: Wifi, hint: "Explore home internet" },
];

const POPULAR_QUERIES = [
  "iPhone 17 Pro Max",
  "Samsung Galaxy S25",
  "Pixel 10 Pro",
  "Unlimited data SIM",
  "Refurbished iPhone",
  "Be Fibre broadband",
];

export function SiteSearch({
  variant = "bar",
}: {
  variant?: "bar" | "inline";
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionsId = useId();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitSearch();
  }

  function submitSearch() {
    const trimmed = query.trim();
    if (trimmed.length === 0) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function pickSuggestion(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  function pickQuery(q: string) {
    setOpen(false);
    setQuery(q);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  const isInline = variant === "inline";

  return (
    <div ref={containerRef} onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); inputRef.current?.focus(); setOpen(false); } }} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }} className={cn("relative w-full text-foreground", isInline ? "max-w-md" : "max-w-2xl mx-auto")}>
      <form onSubmit={handleSubmit} role="search" aria-label={isInline ? "Header search" : "Find phones and plans"}>
        <div className="relative">
          <Search
            className={cn(
              "absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none",
              isInline ? "size-4" : "size-5"
            )}
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder={
              isInline
                ? "Search phones, plans, providers…"
                : "Search iPhone 17, broadband, SIM-only…"
            }
            className={cn(
              "w-full rounded-xl border bg-white text-foreground shadow-sm transition-all [&::-webkit-search-cancel-button]:appearance-none",
              "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1a365d]/40 focus:border-[#1a365d]/40",
              "dark:bg-slate-900 dark:border-slate-700",
              isInline ? "pl-10 pr-20 py-2 text-sm" : "pl-12 pr-28 py-3.5 text-base"
            )}
            aria-label="Site search"
            aria-controls={open ? suggestionsId : undefined}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className={cn("absolute top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted", isInline ? "right-11" : "right-20")}
              aria-label="Clear search"
            >
              <X className={cn(isInline ? "size-3.5" : "size-4")} />
            </button>
          )}
          <button type="submit" disabled={!query.trim()} aria-label="Search deals" className={cn("absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-[#1a365d] text-white transition-colors hover:bg-[#264d77] disabled:opacity-40", isInline ? "p-2" : "px-3 py-2 text-sm font-semibold")}>
            {isInline ? <Search aria-hidden="true" className="size-4" /> : "Search"}
          </button>
        </div>
      </form>

      {open && (
        <div
          id={suggestionsId}
          className={cn(
            "absolute left-0 right-0 mt-2 rounded-xl border bg-white shadow-2xl ring-1 ring-black/5 z-50 overflow-hidden",
            "dark:bg-slate-900 dark:border-slate-700"
          )}
        >
          <div className="p-3 border-b">
            <p className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Quick browse
            </p>
            <div className="grid grid-cols-2 gap-1">
              {QUICK_LINKS.map((s) => (
                <button
                  key={s.href}
                  type="button"
                  onClick={() => pickSuggestion(s.href)}
                  className="flex items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <s.icon className="size-4 mt-0.5 text-[#1a365d] dark:text-[#48bb78] shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{s.label}</div>
                    {s.hint && (
                      <div className="text-xs text-muted-foreground truncate">{s.hint}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="p-3">
            <p className="px-2 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Popular searches
            </p>
            <div className="flex flex-wrap gap-1.5 px-1">
              {POPULAR_QUERIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => pickQuery(q)}
                  className="rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
          {query.trim().length >= 2 && (
            <div className="border-t bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
              <button
                type="button"
                onClick={submitSearch}
                className="text-sm font-semibold text-[#1a365d] dark:text-[#48bb78] hover:underline flex items-center gap-2"
              >
                <Search className="size-4" />
                Search for &ldquo;{query.trim()}&rdquo;
              </button>
            </div>
          )}
          <Link
            href="/search"
            onClick={() => setOpen(false)}
            className="block border-t px-4 py-2.5 text-xs text-center text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Browse advanced search →
          </Link>
        </div>
      )}
    </div>
  );
}
