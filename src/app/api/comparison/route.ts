import { NextRequest, NextResponse } from "next/server";
import { runComparison } from "@/lib/services/comparison.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await runComparison({
      category: body.category || "energy",
      subcategory: body.subcategory,
      postcode: body.postcode,
      sortBy: body.sortBy || "price",
      sortOrder: body.sortOrder || "asc",
      page: body.page || 1,
      perPage: body.perPage || 20,
      filters: body.filters || {},
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to run comparison" }, { status: 500 });
  }
}
