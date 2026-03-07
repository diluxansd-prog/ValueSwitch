"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Star, TrendingUp, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface PlanData {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory: string;
  monthlyCost: number;
  isPromoted: boolean;
  isBestValue: boolean;
  isPopular: boolean;
  providerName: string;
}

export function PlansManagement({
  plans,
  categories,
}: {
  plans: PlanData[];
  categories: string[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = plans.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.providerName.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  async function toggleFlag(
    planId: string,
    flag: "isPromoted" | "isBestValue" | "isPopular",
    current: boolean
  ) {
    setLoading(`${planId}-${flag}`);
    try {
      const res = await fetch("/api/admin/plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, [flag]: !current }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Plan updated");
      router.refresh();
    } catch {
      toast.error("Failed to update plan");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Plans & Deals</h1>
        <p className="text-muted-foreground mt-1">
          Manage {plans.length} plans across all categories
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search plans or providers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          <Button
            size="sm"
            variant={categoryFilter === "all" ? "default" : "outline"}
            onClick={() => setCategoryFilter("all")}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={categoryFilter === cat ? "default" : "outline"}
              onClick={() => setCategoryFilter(cat)}
              className="capitalize"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Plan</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Category</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Price</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Flags</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 50).map((plan) => (
                  <tr key={plan.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{plan.name}</p>
                        <p className="text-xs text-muted-foreground">{plan.providerName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge variant="outline" className="capitalize text-xs">
                        {plan.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm font-medium">
                        £{plan.monthlyCost.toFixed(2)}/mo
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex gap-1">
                        {plan.isPromoted && (
                          <Badge className="text-[10px] bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            Promoted
                          </Badge>
                        )}
                        {plan.isBestValue && (
                          <Badge className="text-[10px] bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Best Value
                          </Badge>
                        )}
                        {plan.isPopular && (
                          <Badge className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Popular
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          size="sm"
                          variant={plan.isPromoted ? "default" : "outline"}
                          onClick={() => toggleFlag(plan.id, "isPromoted", plan.isPromoted)}
                          disabled={loading === `${plan.id}-isPromoted`}
                          title="Toggle Promoted"
                          className="size-8 p-0"
                        >
                          <Sparkles className="size-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant={plan.isBestValue ? "default" : "outline"}
                          onClick={() => toggleFlag(plan.id, "isBestValue", plan.isBestValue)}
                          disabled={loading === `${plan.id}-isBestValue`}
                          title="Toggle Best Value"
                          className="size-8 p-0"
                        >
                          <Star className="size-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant={plan.isPopular ? "default" : "outline"}
                          onClick={() => toggleFlag(plan.id, "isPopular", plan.isPopular)}
                          disabled={loading === `${plan.id}-isPopular`}
                          title="Toggle Popular"
                          className="size-8 p-0"
                        >
                          <TrendingUp className="size-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">No plans found</p>
          )}
          {filtered.length > 50 && (
            <p className="text-center text-xs text-muted-foreground py-3 border-t">
              Showing 50 of {filtered.length} plans. Use search to narrow results.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
