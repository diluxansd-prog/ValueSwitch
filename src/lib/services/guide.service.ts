import { prisma } from "@/lib/prisma";

export async function getGuides(category?: string) {
  try {
    const where: any = { isPublished: true };
    if (category) where.category = category;

    return await prisma.guide.findMany({
      where,
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function getAllGuideSlugs() {
  try {
    const guides = await prisma.guide.findMany({
      where: { isPublished: true },
      select: { slug: true, category: true },
    });
    return guides;
  } catch {
    return [];
  }
}

export async function getGuideBySlug(slug: string) {
  try {
    return await prisma.guide.findUnique({ where: { slug } });
  } catch {
    return null;
  }
}
