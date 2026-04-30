import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function isAdmin() {
  const session = await auth();
  if (!session?.user?.id) return false;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  return user?.role === "admin";
}

const promoSchema = z.object({
  title: z.string().min(2).max(120),
  subtitle: z.string().max(200).nullish(),
  code: z.string().max(40).nullish(),
  ctaLabel: z.string().max(40).default("Shop now"),
  ctaUrl: z.string().url(),
  emoji: z.string().max(8).nullish(),
  bgGradient: z.string().max(80).nullish(),
  startsAt: z.string().or(z.date()),
  endsAt: z.string().or(z.date()),
  isActive: z.boolean().default(true),
  priority: z.number().int().default(0),
  providerId: z.string().nullish(),
});

const updateSchema = promoSchema.partial().extend({
  id: z.string(),
});

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const parsed = promoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const promo = await prisma.merchantPromo.create({
      data: {
        ...parsed.data,
        startsAt: new Date(parsed.data.startsAt),
        endsAt: new Date(parsed.data.endsAt),
      },
    });
    return NextResponse.json({ success: true, promo });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create promo" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    const { id, ...rest } = parsed.data;
    const data: Record<string, unknown> = { ...rest };
    if (rest.startsAt) data.startsAt = new Date(rest.startsAt);
    if (rest.endsAt) data.endsAt = new Date(rest.endsAt);
    const promo = await prisma.merchantPromo.update({
      where: { id },
      data,
    });
    return NextResponse.json({ success: true, promo });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await prisma.merchantPromo.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
