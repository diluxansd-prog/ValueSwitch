import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// One-time admin setup: promotes the currently logged-in user to admin
// Only works if there are NO existing admins in the database
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if any admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "admin" },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "An admin already exists. Use the admin panel to manage roles." },
        { status: 403 }
      );
    }

    // Promote current user to admin
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "admin" },
    });

    return NextResponse.json({
      success: true,
      message: "You are now an admin! Go to /admin to access the admin panel.",
    });
  } catch {
    return NextResponse.json({ error: "Failed to setup admin" }, { status: 500 });
  }
}
