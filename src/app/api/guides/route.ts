import { NextRequest, NextResponse } from "next/server";
import { getGuides } from "@/lib/services/guide.service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || undefined;
  const guides = await getGuides(category);
  return NextResponse.json(guides);
}
