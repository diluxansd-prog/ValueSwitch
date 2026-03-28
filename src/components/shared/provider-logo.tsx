import Image from "next/image";
import { getProviderColor, getProviderInitials } from "@/lib/utils/provider-avatar";
import { cn } from "@/lib/utils";

interface ProviderLogoProps {
  name: string;
  logo?: string | null;
  size?: number;
  className?: string;
}

export function ProviderLogo({ name, logo, size = 40, className }: ProviderLogoProps) {
  if (logo) {
    return (
      <div
        className={cn("relative shrink-0 rounded-full overflow-hidden bg-white", className)}
        style={{ width: size, height: size }}
      >
        <Image
          src={logo}
          alt={`${name} logo`}
          fill
          className="object-contain p-1"
          sizes={`${size}px`}
        />
      </div>
    );
  }

  const textSize = size <= 32 ? "text-[10px]" : size <= 48 ? "text-sm" : "text-base";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white",
        getProviderColor(name),
        textSize,
        className
      )}
      style={{ width: size, height: size }}
    >
      {getProviderInitials(name)}
    </div>
  );
}
