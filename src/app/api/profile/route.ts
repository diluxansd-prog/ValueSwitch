import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileUpdateSchema } from "@/lib/validators/api";

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    const { name, email, phone, postcode } = parsed.data;

    // Check if email is being changed and is already taken
    if (email && email !== session.user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== session.user.id) {
        return NextResponse.json(
          { error: "Email is already in use by another account." },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(postcode !== undefined && { postcode: postcode || null }),
      },
      select: { id: true, name: true, email: true, phone: true, postcode: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to update profile." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete all user data in order (respecting foreign keys)
    await prisma.$transaction([
      prisma.comparisonItem.deleteMany({
        where: { comparison: { userId: session.user.id } },
      }),
      prisma.comparisonHistory.deleteMany({ where: { userId: session.user.id } }),
      prisma.savedSearch.deleteMany({ where: { userId: session.user.id } }),
      prisma.priceAlert.deleteMany({ where: { userId: session.user.id } }),
      prisma.userReview.deleteMany({ where: { userId: session.user.id } }),
      prisma.account.deleteMany({ where: { userId: session.user.id } }),
      prisma.session.deleteMany({ where: { userId: session.user.id } }),
      prisma.user.delete({ where: { id: session.user.id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete account." },
      { status: 500 }
    );
  }
}
