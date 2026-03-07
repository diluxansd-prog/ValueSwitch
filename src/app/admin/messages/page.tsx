import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { MessagesManagement } from "@/components/admin/messages-management";

export const metadata: Metadata = { title: "Messages | Admin | ValueSwitch" };
export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <MessagesManagement
      messages={messages.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      }))}
    />
  );
}
