"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye, EyeOff, BookOpen, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface GuideData {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  isPublished: boolean;
  readTime: number;
  publishedAt: string | null;
  createdAt: string;
}

export function GuidesManagement({ guides }: { guides: GuideData[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = guides.filter(
    (g) =>
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.category.toLowerCase().includes(search.toLowerCase())
  );

  async function togglePublished(guideId: string, currentPublished: boolean) {
    setLoading(guideId);
    try {
      const res = await fetch("/api/admin/guides", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guideId, isPublished: !currentPublished }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success(
        `Guide ${currentPublished ? "unpublished" : "published"}`
      );
      router.refresh();
    } catch {
      toast.error("Failed to update guide");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Guides</h1>
        <p className="text-muted-foreground mt-1">
          {guides.length} guide{guides.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search guides..."
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
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Guide</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Category</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Author</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Read Time</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Status</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((guide) => (
                  <tr key={guide.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{guide.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(guide.createdAt).toLocaleDateString("en-GB")}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge variant="outline" className="capitalize text-xs">
                        {guide.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm">{guide.author}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {guide.readTime} min
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <Badge variant={guide.isPublished ? "default" : "secondary"}>
                        {guide.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => togglePublished(guide.id, guide.isPublished)}
                        disabled={loading === guide.id}
                        className="text-xs"
                      >
                        {guide.isPublished ? (
                          <>
                            <EyeOff className="size-3" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Eye className="size-3" />
                            Publish
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
            <p className="text-center text-sm text-muted-foreground py-8">No guides found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
