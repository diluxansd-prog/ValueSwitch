"use client";

interface PriceDisplayProps {
  amount: number;
  period?: "month" | "year";
  size?: "sm" | "md" | "lg";
  showPeriod?: boolean;
}

export function PriceDisplay({ amount, period = "month", size = "md", showPeriod = true }: PriceDisplayProps) {
  const sizeClasses = {
    sm: "text-lg font-semibold",
    md: "text-2xl font-bold",
    lg: "text-4xl font-bold",
  };

  return (
    <div className="flex items-baseline gap-1">
      <span className="text-sm font-medium text-muted-foreground">£</span>
      <span className={sizeClasses[size]}>{amount.toFixed(2)}</span>
      {showPeriod && (
        <span className="text-sm text-muted-foreground">/{period === "month" ? "mo" : "yr"}</span>
      )}
    </div>
  );
}
