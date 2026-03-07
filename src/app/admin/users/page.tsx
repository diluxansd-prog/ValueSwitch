import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { UsersManagement } from "@/components/admin/users-management";

export const metadata: Metadata = {
  title: "Manage Users | Admin | ValueSwitch",
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      postcode: true,
      createdAt: true,
      _count: {
        select: {
          savedSearches: true,
          comparisons: true,
          alerts: true,
          reviews: true,
        },
      },
    },
  });

  return (
    <UsersManagement
      users={users.map((u) => ({
        id: u.id,
        name: u.name || "No name",
        email: u.email,
        role: u.role,
        postcode: u.postcode || "",
        createdAt: u.createdAt.toISOString(),
        savedSearches: u._count.savedSearches,
        comparisons: u._count.comparisons,
        alerts: u._count.alerts,
        reviews: u._count.reviews,
      }))}
    />
  );
}
