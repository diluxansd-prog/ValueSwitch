import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { getLocalGuides } from "./local-guides";

export async function getGuides(category?: string) {
  try {
    const where: Prisma.GuideWhereInput = { isPublished: true };
    if (category) where.category = category;

    return await prisma.guide.findMany({
      where,
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    return (await getLocalGuides()).filter(guide => !category || guide.category === category);
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
    return (await getLocalGuides()).map(({ slug, category }) => ({ slug, category }));
  }
}

export async function getGuideBySlug(slug: string) {
  try {
    return await prisma.guide.findFirst({ where: { slug, isPublished: true } });
  } catch {
    return (await getLocalGuides()).find(guide => guide.slug === slug) ?? null;
  }
}
