"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Search, ExternalLink, ToggleLeft, ToggleRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ProviderData {
  id: string;
  name: string;
  slug: string;
  website: string;
  trustScore: number;
  reviewCount: number;
  isActive: boolean;
  categories: string;
  planCount: number;
  reviewsCount: number;
}

export function ProvidersManagement({ providers }: { providers: ProviderData[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = providers.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  async function toggleActive(providerId: string, currentActive: boolean) {
    setLoading(providerId);
    try {
      const res = await fetch("/api/admin/providers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, isActive: !currentActive }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success(
        `Provider ${currentActive ? "deactivated" : "activated"}`
      );
      router.refresh();
    } catch {
      toast.error("Failed to update provider");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Providers</h1>
        <p className="text-muted-foreground mt-1">
          {providers.length} provider{providers.length !== 1 ? "s" : ""} registered
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search providers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Provider</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Categories</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Trust Score</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Plans</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Status</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((provider) => (
                  <tr key={provider.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{provider.name}</p>
                        {provider.website && (
                          <a
                            href={provider.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                          >
                            {provider.website.replace(/https?:\/\//, "").replace(/\/$/, "")}
                            <ExternalLink className="size-3" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {provider.categories.split(",").map((cat) => (
                          <Badge key={cat} variant="outline" className="text-xs capitalize">
                            {cat.trim()}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm">{provider.trustScore.toFixed(1)}/5</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm">{provider.planCount}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <Badge variant={provider.isActive ? "default" : "secondary"}>
                        {provider.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleActive(provider.id, provider.isActive)}
                        disabled={loading === provider.id}
                        className="text-xs"
                      >
                        {provider.isActive ? (
                          <>
                            <ToggleRight className="size-3" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="size-3" />
                            Activate
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">No providers found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
