"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Play,
  Trash2,
  Loader2,
  Zap,
  Wifi,
  Smartphone,
  Shield,
  PiggyBank,
  Building2,
  MapPin,
  Calendar,
  Plus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SavedSearch {
  id: string;
  name: string;
  category: string;
  subcategory: string | null;
  postcode: string | null;
  createdAt: string;
}

const categoryIcons: Record<string, typeof Zap> = {
  energy: Zap,
  broadband: Wifi,
  mobile: Smartphone,
  insurance: Shield,
  finance: PiggyBank,
  business: Building2,
};

const categoryColors: Record<string, string> = {
  energy: "bg-yellow-100 text-yellow-700",
  broadband: "bg-blue-100 text-blue-700",
  mobile: "bg-purple-100 text-purple-700",
  insurance: "bg-green-100 text-green-700",
  finance: "bg-emerald-100 text-emerald-700",
  business: "bg-slate-100 text-slate-700",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function SavedSearchesClient({
  searches,
}: {
  searches: SavedSearch[];
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/saved-searches/${id}`, { method: "DELETE" });
      router.refresh();
    } catch {
      toast.error("Failed to delete search. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Saved Searches
          </h1>
          <p className="mt-1 text-muted-foreground">
            Quickly re-run your saved comparisons.
          </p>
        </div>
      </div>

      {searches.length > 0 ? (
        <div className="grid gap-4">
          {searches.map((search) => {
            const Icon =
              categoryIcons[search.category.toLowerCase()] || Search;
            const colorClass =
              categoryColors[search.category.toLowerCase()] ||
              "bg-gray-100 text-gray-700";
            const isDeleting = deletingId === search.id;

            return (
              <Card key={search.id} className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4 sm:p-6">
                  <div
                    className={`flex items-center justify-center size-12 rounded-lg shrink-0 ${colorClass}`}
                  >
                    <Icon className="size-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{search.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {search.category}
                      </Badge>
                      {search.subcategory && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {search.subcategory}
                        </Badge>
                      )}
                      {search.postcode && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3" />
                          {search.postcode}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="size-3" />
                        {formatDate(search.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      asChild
                      className="bg-gradient-to-r from-[#1a365d] to-[#38a169] hover:from-[#2a4a7f] hover:to-[#48bb78] text-white border-0"
                    >
                      <Link href={`/${search.category.toLowerCase()}`}>
                        <Play className="size-4" />
                        <span className="hidden sm:inline">Run again</span>
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(search.id)}
                      disabled={isDeleting}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      {isDeleting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex items-center justify-center size-16 rounded-full bg-muted mb-4">
              <Search className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No saved searches</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              When you run a comparison, you can save it for quick access later.
              Start comparing to save your first search.
            </p>
            <Button asChild className="mt-6">
              <Link
                href="/energy"
                className="bg-gradient-to-r from-[#1a365d] to-[#38a169] hover:from-[#2a4a7f] hover:to-[#48bb78] text-white border-0"
              >
                <Plus className="size-4" />
                Start comparing
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
