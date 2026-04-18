import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pingIndexNow } from "@/lib/indexnow";
import { siteConfig } from "@/config/seo";

async function isAdmin() {
  const session = await auth();
  if (!session?.user?.id) return false;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  return user?.role === "admin";
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { guideId, isPublished } = await req.json();

    if (!guideId || typeof isPublished !== "boolean") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const guide = await prisma.guide.update({
      where: { id: guideId },
      data: {
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
      select: { category: true, slug: true },
    });

    // When a guide becomes published, tell Bing / Yandex / DuckDuckGo
    // immediately via IndexNow (don't block the response).
    if (isPublished) {
      const url = `${siteConfig.url}/guides/${guide.category}/${guide.slug}`;
      pingIndexNow([url]).catch(() => null);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update guide" }, { status: 500 });
  }
}
