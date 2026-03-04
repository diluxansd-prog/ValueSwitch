import { NextRequest, NextResponse } from "next/server";
import { getPopularDeals } from "@/lib/services/deal.service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || undefined;
  const limit = parseInt(searchParams.get("limit") || "6");
  const deals = await getPopularDeals(category, limit);
  return NextResponse.json(deals);
}
