"use client";

import { useState, useCallback } from "react";
import { Filter, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface FilterValues {
  minPrice?: number;
  maxPrice?: number;
  providers?: string[];
  // Energy
  tariffType?: string;
  greenOnly?: boolean;
  paymentMethod?: string;
  // Broadband
  minSpeed?: number;
  includesTV?: boolean;
  contractLength?: number;
  // Mobile
  dealType?: string;
  minData?: string;
  network?: string;
  // Insurance
  coverLevel?: string;
  // Finance
  productType?: string;
}

interface ComparisonFiltersProps {
  category: string;
  onFiltersChange: (filters: FilterValues) => void;
  providers: string[];
  className?: string;
}

export function ComparisonFilters({
  category,
  onFiltersChange,
  providers,
  className,
}: ComparisonFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>({});
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);

  const updateFilter = useCallback(
    (key: keyof FilterValues, value: unknown) => {
      setFilters((prev) => {
        const updated = { ...prev, [key]: value };
        return updated;
      });
    },
    []
  );

  const toggleProvider = useCallback((provider: string) => {
    setSelectedProviders((prev) => {
      const updated = prev.includes(provider)
        ? prev.filter((p) => p !== provider)
        : [...prev, provider];
      return updated;
    });
  }, []);

  function handleApply() {
    onFiltersChange({
      ...filters,
      providers: selectedProviders.length > 0 ? selectedProviders : undefined,
    });
  }

  function handleClear() {
    setFilters({});
    setSelectedProviders([]);
    onFiltersChange({});
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground">
          <Filter className="size-4" />
          Filters
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="mr-1 size-3" />
          Clear all
        </Button>
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Price Range</Label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              £
            </span>
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice ?? ""}
              onChange={(e) =>
                updateFilter(
                  "minPrice",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="h-9 pl-6 text-sm"
            />
          </div>
          <span className="text-muted-foreground">-</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              £
            </span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice ?? ""}
              onChange={(e) =>
                updateFilter(
                  "maxPrice",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="h-9 pl-6 text-sm"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Provider Filter */}
      {providers.length > 0 && (
        <>
          <div className="space-y-3">
            <Label className="text-sm font-medium">Provider</Label>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {providers.map((provider) => (
                <label
                  key={provider}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 hover:bg-accent"
                >
                  <Checkbox
                    checked={selectedProviders.includes(provider)}
                    onCheckedChange={() => toggleProvider(provider)}
                  />
                  <span className="text-sm">{provider}</span>
                </label>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Energy-specific filters */}
      {category === "energy" && (
        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tariff Type</Label>
            <div className="space-y-2">
              {["Fixed", "Variable", "Tracker"].map((type) => (
                <label
                  key={type}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 hover:bg-accent"
                >
                  <Checkbox
                    checked={filters.tariffType === type}
                    onCheckedChange={(checked) =>
                      updateFilter("tariffType", checked ? type : undefined)
                    }
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 hover:bg-accent">
              <Checkbox
                checked={filters.greenOnly ?? false}
                onCheckedChange={(checked) =>
                  updateFilter("greenOnly", checked === true)
                }
              />
              <span className="text-sm font-medium">Green energy only</span>
            </label>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Payment Method</Label>
            <div className="space-y-2">
              {["Direct debit", "Prepayment", "Standard credit"].map(
                (method) => (
                  <label
                    key={method}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 hover:bg-accent"
                  >
                    <Checkbox
                      checked={filters.paymentMethod === method}
                      onCheckedChange={(checked) =>
                        updateFilter(
                          "paymentMethod",
                          checked ? method : undefined
                        )
                      }
                    />
                    <span className="text-sm">{method}</span>
                  </label>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Broadband-specific filters */}
      {category === "broadband" && (
        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Minimum Speed</Label>
            <div className="space-y-2">
              {[
                { label: "10+ Mbps", value: 10 },
                { label: "30+ Mbps", value: 30 },
                { label: "50+ Mbps", value: 50 },
                { label: "100+ Mbps", value: 100 },
                { label: "300+ Mbps", value: 300 },
              ].map((speed) => (
                <label
                  key={speed.value}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 hover:bg-accent"
                >
                  <Checkbox
                    checked={filters.minSpeed === speed.value}
                    onCheckedChange={(checked) =>
                      updateFilter(
                        "minSpeed",
                        checked ? speed.value : undefined
                      )
                    }
                  />
                  <span className="text-sm">{speed.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 hover:bg-accent">
              <Checkbox
                checked={filters.includesTV ?? false}
                onCheckedChange={(checked) =>
                  updateFilter("includesTV", checked === true)
                }
              />
              <span className="text-sm font-medium">Includes TV</span>
            </label>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Contract Length</Label>
            <div className="space-y-2">
              {[
                { label: "12 months", value: 12 },
                { label: "18 months", value: 18 },
                { label: "24 months", value: 24 },
              ].map((length) => (
                <label
                  key={length.value}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 hover:bg-accent"
                >
                  <Checkbox
                    checked={filters.contractLength === length.value}
                    onCheckedChange={(checked) =>
                      updateFilter(
                        "contractLength",
                        checked ? length.value : undefined
                      )
                    }
                  />
                  <span className="text-sm">{length.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile-specific filters */}
      {category === "mobile" && (
        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Deal Type</Label>
            <div className="space-y-2">
              {["SIM Only", "Contract", "Pay As You Go"].map((type) => (
                <label
                  key={type}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 hover:bg-accent"
                >
                  <Checkbox
                    checked={filters.dealType === type}
                    onCheckedChange={(checked) =>
                      updateFilter("dealType", checked ? type : undefined)
                    }
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Minimum Data</Label>
            <div className="space-y-2">
              {["1GB", "5GB", "10GB", "25GB", "50GB", "Unlimited"].map(
                (data) => (
                  <label
                    key={data}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 hover:bg-accent"
                  >
                    <Checkbox
                      checked={filters.minData === data}
                      onCheckedChange={(checked) =>
                        updateFilter("minData", checked ? data : undefined)
                      }
                    />
                    <span className="text-sm">{data}</span>
                  </label>
                )
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Network</Label>
            <div className="space-y-2">
              {["EE", "Three", "Vodafone", "O2", "Sky Mobile", "iD Mobile"].map(
                (network) => (
                  <label
                    key={network}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 hover:bg-accent"
                  >
                    <Checkbox
                      checked={filters.network === network}
                      onCheckedChange={(checked) =>
                        updateFilter("network", checked ? network : undefined)
                      }
                    />
                    <span className="text-sm">{network}</span>
                  </label>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Insurance-specific filters */}
      {category === "insurance" && (
        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Cover Level</Label>
            <div className="space-y-2">
              {[
                "Third Party Only",
                "Third Party, Fire & Theft",
                "Comprehensive",
              ].map((level) => (
                <label
                  key={level}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 hover:bg-accent"
                >
                  <Checkbox
                    checked={filters.coverLevel === level}
                    onCheckedChange={(checked) =>
                      updateFilter("coverLevel", checked ? level : undefined)
                    }
                  />
                  <span className="text-sm">{level}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Finance-specific filters */}
      {category === "finance" && (
        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Product Type</Label>
            <div className="space-y-2">
              {[
                "Credit Card",
                "Personal Loan",
                "Mortgage",
                "Savings Account",
              ].map((type) => (
                <label
                  key={type}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-0.5 hover:bg-accent"
                >
                  <Checkbox
                    checked={filters.productType === type}
                    onCheckedChange={(checked) =>
                      updateFilter("productType", checked ? type : undefined)
                    }
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      <Separator />

      {/* Apply button */}
      <Button
        onClick={handleApply}
        className="w-full bg-gradient-to-r from-[#1a365d] to-[#38a169] text-white hover:from-[#2a4a7f] hover:to-[#48bb78]"
      >
        Apply Filters
      </Button>
    </div>
  );
}
