"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Popular Phones</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {phones.map((phone) => (
          <Link
            key={phone.brand}
            href={`/mobile/compare?brand=${encodeURIComponent(phone.brand)}`}
          >
            <Card className="group border border-border/60 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 h-full">
              <CardContent className="flex flex-col items-center p-4 text-center">
                <div className="relative w-full aspect-square mb-3 max-w-[140px]">
                  <Image
                    src={phone.image}
                    alt={phone.brand}
                    fill
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-200"
                    sizes="140px"
                  />
                </div>
                <p className="text-xs text-muted-foreground">{phone.brand}</p>
                <p className="text-sm font-bold mt-0.5">
                  {phone.dealCount} deal{phone.dealCount !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {phone.setupFee === 0 ? "No upfront cost" : `£${phone.setupFee.toFixed(0)} upfront`}
                </p>
                <p className="text-xs font-semibold text-[#38a169] mt-0.5">
                  from £{phone.cheapestPrice.toFixed(2)}/mo
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full text-xs group-hover:bg-[#1a365d] group-hover:text-white group-hover:border-[#1a365d] transition-colors"
                >
                  See deals
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
