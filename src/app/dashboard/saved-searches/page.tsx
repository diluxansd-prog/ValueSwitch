import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { SavedSearchesClient } from "@/components/dashboard/saved-searches-client";

export const metadata: Metadata = {
  title: "Saved Searches | ValueSwitch",
  description: "View and manage your saved comparison searches.",
};

export default async function SavedSearchesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const searches = await prisma.savedSearch.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      category: true,
      subcategory: true,
      postcode: true,
      createdAt: true,
    },
  });

  return (
    <SavedSearchesClient
      searches={searches.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        subcategory: s.subcategory,
        postcode: s.postcode,
        createdAt: s.createdAt.toISOString(),
      }))}
    />
  );
}
