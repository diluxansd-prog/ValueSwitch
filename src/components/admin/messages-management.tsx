"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, MailOpen, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function MessagesManagement({ messages }: { messages: Message[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = messages.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase())
  );

  const unreadCount = messages.filter((m) => !m.isRead).length;

  async function markRead(id: string) {
    try {
      await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: id, isRead: true }),
      });
      router.refresh();
    } catch {
      toast.error("Failed to update");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground mt-1">
          {messages.length} message{messages.length !== 1 ? "s" : ""} ({unreadCount} unread)
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input placeholder="Search messages..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="space-y-3">
        {filtered.map((msg) => (
          <Card key={msg.id} className={msg.isRead ? "opacity-70" : ""}>
            <CardContent className="p-4">
              <div
                className="flex items-start justify-between gap-4 cursor-pointer"
                onClick={() => {
                  setExpanded(expanded === msg.id ? null : msg.id);
                  if (!msg.isRead) markRead(msg.id);
                }}
              >
                <div className="flex items-start gap-3 min-w-0">
                  {msg.isRead ? (
                    <MailOpen className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                  ) : (
                    <Mail className="size-5 text-blue-500 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{msg.subject}</p>
                    <p className="text-xs text-muted-foreground">{msg.name} &lt;{msg.email}&gt;</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!msg.isRead && <Badge variant="default" className="text-[10px]">New</Badge>}
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.createdAt).toLocaleDateString("en-GB")}
                  </span>
                </div>
              </div>
              {expanded === msg.id && (
                <div className="mt-4 ml-8 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <a href={`mailto:${msg.email}?subject=Re: ${msg.subject}`} className="mt-3 inline-block text-xs text-blue-600 hover:underline">
                    Reply via email →
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">No messages found</p>
        )}
      </div>
    </div>
  );
}
