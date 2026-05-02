import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { scorePhoneRecency, sortByRecencyThenPrice } from "@/lib/utils/phone-recency";

/**
 * Hand-picks the most modern phones available across the catalogue and
 * surfaces them on the home page. iPhone 17 Pro Max ranks above iPhone 13;
 * Galaxy S25 above S22, etc.
 *
 * Pulls a wide candidate pool (top 200 cheapest mobile plans WITH images)
 * and re-sorts client-side by phone-model recency. We over-fetch on
 * purpose so post-filter we still have enough cards to show 8.
 */
export async function LatestPhones() {
  let candidates: Array<{
    id: string;
    name: string;
    slug: string;
    monthlyCost: number;
    setupFee: number;
    contractLength: number | null;
    imageUrl: string | null;
    subcategory: string | null;
    handsetModel: string | null;
    provider: { name: string; slug: string };
  }> = [];
  try {
    candidates = await prisma.plan.findMany({
      where: {
        category: "mobile",
        imageUrl: { not: null },
        handsetModel: { not: null },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { monthlyCost: "asc" },
      take: 200,
      select: {
        id: true,
        name: true,
        slug: true,
        monthlyCost: true,
        setupFee: true,
        contractLength: true,
        imageUrl: true,
        subcategory: true,
        handsetModel: true,
        provider: { select: { name: true, slug: true } },
      },
    });
  } catch (err) {
    console.error("[LatestPhones] DB unavailable, hiding section:", err);
    return null;
  }

  // Keep only deals that match a known modern model family
  const flagships = sortByRecencyThenPrice(candidates).filter(
    (c) => scorePhoneRecency(c.name).score > 0
  );

  if (flagships.length === 0) return null;

  // Dedupe by (handsetModel + recency model label) so we don't show three
  // variants of the same phone — pick the cheapest representative for each.
  const seen = new Set<string>();
  const picks: typeof flagships = [];
  for (const f of flagships) {
    const r = scorePhoneRecency(f.name);
    const key = `${f.handsetModel ?? ""}|${r.modelLabel}`;
    if (seen.has(key)) continue;
    seen.add(key);
    picks.push(f);
    if (picks.length >= 8) break;
  }

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <Badge className="mb-3 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
              <Sparkles className="size-3 mr-1" />
              Newest first
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight">
              Latest flagship phones
            </h2>
            <p className="mt-1 text-muted-foreground">
              The phones everyone's actually buying right now — iPhone 17, Galaxy S25, Pixel 10.
            </p>
          </div>
          <Button variant="outline" asChild className="shrink-0">
            <Link href="/mobile">
              Browse all phones
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {picks.map((p) => {
            const recency = scorePhoneRecency(p.name);
            const isSimFree = p.subcategory === "sim-free";
            return (
              <Link key={p.id} href={`/deals/${p.slug}`} className="group">
                <Card className="h-full border border-border/60 transition-all hover:-translate-y-1.5 hover:shadow-xl">
                  <CardContent className="p-4">
                    <div className="relative aspect-square rounded-xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 mb-3 overflow-hidden">
                      {p.imageUrl ? (
                        <Image
                          src={p.imageUrl}
                          alt={p.name}
                          fill
                          className="object-contain p-3 group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center text-3xl">📱</div>
                      )}
                      {recency.modelLabel && (
                        <Badge className="absolute top-2 left-2 bg-[#1a365d] text-white border-0 text-[10px]">
                          {recency.modelLabel.split(" ").slice(0, 2).join(" ")}
                        </Badge>
                      )}
                      {isSimFree && (
                        <Badge className="absolute top-2 right-2 bg-emerald-600 text-white border-0 text-[10px]">
                          Refurb
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {p.provider.name}
                    </p>
                    <p className="text-sm font-semibold leading-tight line-clamp-2 mt-0.5 mb-2 min-h-[2.5rem]">
                      {p.name.replace(/ - £[\d.]+\/mo.*/, "")}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold">£{Math.floor(p.monthlyCost)}</span>
                      <span className="text-xs text-muted-foreground">
                        {isSimFree ? "total" : "/mo"}
                      </span>
                    </div>
                    {!isSimFree && p.contractLength && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {p.contractLength} mo contract
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
