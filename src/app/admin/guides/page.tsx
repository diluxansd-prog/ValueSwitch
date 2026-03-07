import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { GuidesManagement } from "@/components/admin/guides-management";

export const metadata: Metadata = {
  title: "Manage Guides | Admin | ValueSwitch",
};

export const dynamic = "force-dynamic";

export default async function AdminGuidesPage() {
  const guides = await prisma.guide.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      author: true,
      isPublished: true,
      readTime: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  return (
    <GuidesManagement
      guides={guides.map((g) => ({
        id: g.id,
        title: g.title,
        slug: g.slug,
        category: g.category,
        author: g.author || "Unknown",
        isPublished: g.isPublished,
        readTime: g.readTime || 0,
        publishedAt: g.publishedAt?.toISOString() || null,
        createdAt: g.createdAt.toISOString(),
      }))}
    />
  );
}
