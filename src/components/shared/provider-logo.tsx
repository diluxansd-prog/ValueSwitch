"use client";

import Image from "next/image";
import { useState } from "react";
import { getProviderColor, getProviderInitials } from "@/lib/utils/provider-avatar";
import { getBrandColor } from "@/config/brand-colors";
import { cn } from "@/lib/utils";

interface ProviderLogoProps {
  name: string;
  /** Provider.slug — drives the brand-colour palette lookup */
  slug?: string;
  logo?: string | null;
  size?: number;
  className?: string;
}

/**
 * Renders a provider avatar in this priority order:
 *   1. The hosted `logo` image when present and loads successfully.
 *   2. A REAL brand-coloured gradient + initials when we know the brand
 *      (Vodafone red, Be Fibre blue, Mozillion green, etc.).
 *   3. A generic deterministic-coloured gradient + name initials.
 *
 * The whole point: never show a broken-image icon, never look generic
 * for a known brand.
 */
export function ProviderLogo({
  name,
  slug,
  logo,
  size = 40,
  className,
}: ProviderLogoProps) {
  const [errored, setErrored] = useState(false);
  const showLogo = logo && !errored;
  const brand = slug ? getBrandColor(slug) : null;

  if (showLogo) {
    return (
      <div
        className={cn(
          "relative shrink-0 rounded-full overflow-hidden bg-white",
          className
        )}
        style={{ width: size, height: size }}
      >
        <Image
          src={logo}
          alt={`${name} logo`}
          fill
          className="object-contain p-1"
          sizes={`${size}px`}
          onError={() => setErrored(true)}
          unoptimized={false}
        />
      </div>
    );
  }

  const textSize =
    size <= 32 ? "text-[10px]" : size <= 48 ? "text-sm" : "text-base";

  // Real brand-coloured avatar (Vodafone red, Lebara blue, etc.)
  if (brand) {
    const initials = brand.abbr || getProviderInitials(name);
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full font-bold ring-1 ring-black/5",
          textSize,
          className
        )}
        style={{
          width: size,
          height: size,
          background: `linear-gradient(135deg, ${brand.from} 0%, ${brand.to} 100%)`,
          color: brand.text || "white",
        }}
        aria-label={`${name} logo`}
      >
        {initials}
      </div>
    );
  }

  // Generic fallback for unknown brands
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white",
        getProviderColor(name),
        textSize,
        className
      )}
      style={{ width: size, height: size }}
      aria-label={`${name} logo`}
    >
      {getProviderInitials(name)}
    </div>
  );
}
