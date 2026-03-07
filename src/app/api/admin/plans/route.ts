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
    const body = await req.json();
    const { planId, ...updates } = body;

    if (!planId) {
      return NextResponse.json({ error: "Plan ID required" }, { status: 400 });
    }

    // Only allow toggling specific flags
    const allowed = ["isPromoted", "isBestValue", "isPopular"];
    const data: Record<string, boolean> = {};
    for (const key of allowed) {
      if (typeof updates[key] === "boolean") {
        data[key] = updates[key];
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid updates" }, { status: 400 });
    }

    await prisma.plan.update({
      where: { id: planId },
      data,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}
