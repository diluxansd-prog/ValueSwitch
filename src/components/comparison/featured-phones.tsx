"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PhoneModel {
  brand: string;
  image: string;
  cheapestPrice: number;
  setupFee: number;
  dealCount: number;
}

interface FeaturedPhonesProps {
  phones: PhoneModel[];
}

export function FeaturedPhones({ phones }: FeaturedPhonesProps) {
  if (phones.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-2">Popular Phones</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Browse by brand and find the best deal
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
        {phones.map((phone) => (
          <Link
            key={phone.brand}
            href={`/mobile/compare?brand=${encodeURIComponent(phone.brand)}`}
            className="group"
          >
            <div className="relative rounded-2xl border border-border/60 bg-white dark:bg-slate-800/50 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              {/* Image container - large */}
              <div className="relative aspect-[3/4] bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-6">
                <Image
                  src={phone.image}
                  alt={phone.brand}
                  fill
                  className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                />
                {/* Deal count badge */}
                <div className="absolute top-3 left-3 bg-[#1a365d] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  {phone.dealCount} deals
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-xs text-muted-foreground">Brand</p>
                <h3 className="text-lg font-bold mt-0.5">{phone.brand}</h3>

                <div className="mt-3 pt-3 border-t border-border/40">
                  <p className="text-xs text-muted-foreground">
                    {phone.setupFee === 0 ? "No upfront cost from" : `£${phone.setupFee.toFixed(0)} upfront from`}
                  </p>
                  <p className="text-xl font-bold text-[#1a365d] dark:text-[#48bb78]">
                    £{phone.cheapestPrice.toFixed(2)}
                    <span className="text-sm font-normal text-muted-foreground"> /month</span>
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-3 text-sm font-semibold group-hover:bg-[#1a365d] group-hover:text-white group-hover:border-[#1a365d] transition-colors"
                >
                  See all deals
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
