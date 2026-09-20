import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { isPlausibleHandsetDeal } from "@/lib/deal-quality";

/**
 * Homepage feature band for the current flagship launch.
 *
 * Pulls the cheapest live iPhone 18 Pro Max listing for the image and
 * price, and sends visitors to our own landing page (which carries the
 * full comparison plus a tracked retailer link). Renders nothing when
 * no live listing exists, so it can never advertise a phantom price.
 */
export async function IPhone18Banner() {
  let priceIsReliable = true;
  let deal: {
    slug: string;
    name: string;
    monthlyCost: number;
    setupFee: number;
    contractLength: number | null;
    imageUrl: string | null;
    provider: { name: string };
  } | null = null;

  try {
    const candidates = await prisma.plan.findMany({
      where: {
        category: "mobile",
        imageUrl: { not: null },
        provider: { isActive: true },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        AND: [
          {
            OR: [
              { name: { contains: "iPhone 18 Pro Max", mode: "insensitive" } },
              {
                handsetModel: {
                  contains: "iPhone 18 Pro Max",
                  mode: "insensitive",
                },
              },
            ],
          },
        ],
      },
      orderBy: { monthlyCost: "asc" },
      take: 20,
      select: {
        slug: true,
        name: true,
        monthlyCost: true,
        setupFee: true,
        contractLength: true,
        imageUrl: true,
        provider: { select: { name: true } },
      },
    });
    // Feed rows that price only the airtime would advertise a Pro Max
    // for £13/month — quote a price only when the whole-term cost could
    // actually include the phone.
    deal =
      candidates.find((c) => isPlausibleHandsetDeal(c)) ?? candidates[0] ?? null;
    if (deal && !isPlausibleHandsetDeal(deal)) {
      priceIsReliable = false;
    }
  } catch {
    deal = null;
  }

  if (!deal?.imageUrl) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0b1120] via-[#1e1b4b] to-[#0f172a] text-white">
      <div
        aria-hidden="true"
        className="absolute -right-24 -top-24 size-96 rounded-full bg-indigo-500/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -left-24 size-96 rounded-full bg-emerald-400/10 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_320px] lg:py-16">
        <div>
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#d9ef96] backdrop-blur-sm">
            <Sparkles className="size-3.5" />
            Just launched
          </span>
          <h2 className="text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
            iPhone 18 Pro Max
            <span className="mt-1 block text-[#d9ef96]">
              {priceIsReliable
                ? `from £${deal.monthlyCost.toFixed(2)}/month`
                : "compare every live deal"}
            </span>
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/75">
            Every live iPhone 18 deal our UK partners are running — Pro and
            Pro Max, contract and SIM-free — compared side by side and sorted
            cheapest first.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/70">
            <span className="flex items-center gap-1.5">
              <Zap className="size-3.5 text-[#d9ef96]" />
              {priceIsReliable
                ? `Live prices from ${deal.provider.name} and others`
                : "Prices confirmed on each retailer's page"}
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-[#d9ef96]" />
              Price-locked options available
            </span>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/best/iphone-18-deals-uk"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#0b1120] shadow-lg transition-transform hover:-translate-y-0.5"
            >
              Compare iPhone 18 deals
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/offers"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Price-locked pre-orders
            </Link>
          </div>
        </div>

        <Link
          href="/best/iphone-18-deals-uk"
          aria-label="Compare iPhone 18 Pro Max deals"
          className="group relative mx-auto block aspect-square w-[240px] overflow-hidden rounded-3xl bg-white/95 shadow-2xl ring-1 ring-white/20 lg:w-[300px]"
        >
          <Image
            src={deal.imageUrl}
            alt="iPhone 18 Pro Max"
            fill
            sizes="(max-width: 1024px) 240px, 300px"
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
            priority
          />
        </Link>
      </div>
    </section>
  );
}
