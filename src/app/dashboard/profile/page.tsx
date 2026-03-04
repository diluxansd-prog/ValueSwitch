import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ProfileClient } from "@/components/dashboard/profile-client";

export const metadata: Metadata = {
  title: "Profile | ValueSwitch",
  description: "Manage your profile information and password.",
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      postcode: true,
      image: true,
      createdAt: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <ProfileClient
      user={{
        id: user.id,
        name: user.name || "",
        email: user.email,
        phone: user.phone || "",
        postcode: user.postcode || "",
        image: user.image,
        createdAt: user.createdAt.toISOString(),
      }}
    />
  );
}
