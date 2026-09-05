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
    const { providerId, slug, isActive, website } = await req.json();

    const data: { isActive?: boolean; website?: string } = {};
    if (typeof isActive === "boolean") data.isActive = isActive;
    if (typeof website === "string") {
      try {
        const u = new URL(website);
        if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error();
      } catch {
        return NextResponse.json({ error: "Invalid website URL" }, { status: 400 });
      }
      data.website = website;
    }

    if ((!providerId && !slug) || Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    await prisma.provider.update({
      where: providerId ? { id: providerId } : { slug },
      data,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update provider" }, { status: 500 });
  }
}
