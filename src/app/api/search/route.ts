import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ deals: [], providers: [], guides: [] });
    }

    const query = `%${q}%`;

    const [deals, providers, guides] = await Promise.all([
      prisma.plan.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
            { category: { contains: q } },
          ],
        },
        include: { provider: { select: { name: true, slug: true } } },
        take: 10,
        orderBy: { monthlyCost: "asc" },
      }),
      prisma.provider.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          trustScore: true,
          reviewCount: true,
          categories: true,
          _count: { select: { plans: true } },
        },
        take: 6,
      }),
      prisma.guide.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { excerpt: { contains: q } },
            { category: { contains: q } },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          excerpt: true,
          readTime: true,
        },
        take: 6,
      }),
    ]);

    return NextResponse.json({ deals, providers, guides });
  } catch {
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
