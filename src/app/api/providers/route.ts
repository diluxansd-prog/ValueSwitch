import { NextRequest, NextResponse } from "next/server";
import { getProviders } from "@/lib/services/provider.service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || undefined;
  const providers = await getProviders(category);
  return NextResponse.json(providers);
}
