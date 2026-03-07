import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    await prisma.guide.update({
      where: { id: guideId },
      data: {
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update guide" }, { status: 500 });
  }
}
