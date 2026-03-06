import { NextRequest, NextResponse } from "next/server";
import { runComparison } from "@/lib/services/comparison.service";
import { comparisonSchema } from "@/lib/validators/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const result = await runComparison({
      category: searchParams.get("category") || "energy",
      subcategory: searchParams.get("subcategory") || undefined,
      postcode: searchParams.get("postcode") || undefined,
      sortBy: searchParams.get("sortBy") || "price",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "asc",
      page: Number(searchParams.get("page")) || 1,
      perPage: Number(searchParams.get("perPage")) || 20,
      filters: {
        minPrice: searchParams.get("minPrice") || undefined,
        maxPrice: searchParams.get("maxPrice") || undefined,
        greenOnly: searchParams.get("greenOnly") === "true" || undefined,
        tariffType: searchParams.get("tariffType") || undefined,
        provider: searchParams.get("providers") || undefined,
        minSpeed: searchParams.get("minSpeed") || undefined,
        contractLength: searchParams.get("contractLength") || undefined,
      },
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to run comparison" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = comparisonSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    const result = await runComparison(parsed.data);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to run comparison" }, { status: 500 });
  }
}
