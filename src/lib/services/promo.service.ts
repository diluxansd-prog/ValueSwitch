import { prisma } from "@/lib/prisma";

/**
 * Get all live promos — active flag set, current time within startsAt..endsAt.
 * Sorted by priority (highest first) then most-recently-created.
 */
export async function getActivePromos() {
  try {
    const now = new Date();
    return await prisma.merchantPromo.findMany({
      where: {
        isActive: true,
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });
  } catch {
    return [];
  }
}
