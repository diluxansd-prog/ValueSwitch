import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { emailAlerts, priceDropAlerts, weeklyDigest } = body;

    // In production, save these preferences to the database
    // For now, acknowledge the update
    return NextResponse.json({
      success: true,
      preferences: { emailAlerts, priceDropAlerts, weeklyDigest },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update notification preferences." },
      { status: 500 }
    );
  }
}
