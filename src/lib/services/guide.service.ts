import { prisma } from "@/lib/prisma";

export async function getGuides(category?: string) {
  const where: any = { isPublished: true };
  if (category) where.category = category;

  return prisma.guide.findMany({
    where,
    orderBy: { publishedAt: "desc" },
  });
}

export async function getGuideBySlug(slug: string) {
  return prisma.guide.findUnique({ where: { slug } });
}
