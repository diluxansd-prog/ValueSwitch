import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, BadgeCheck } from "lucide-react";

interface AuthorBylineProps {
  author: string;
  role?: string;
  avatarUrl?: string;
  publishedAt?: string | Date | null;
  updatedAt?: string | Date | null;
  readTime?: number;
}

export function AuthorByline({
  author,
  role = "Editor",
  avatarUrl,
  publishedAt,
  updatedAt,
  readTime,
}: AuthorBylineProps) {
  const initials = author
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const fmt = (d: string | Date) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const pub = publishedAt ? fmt(publishedAt) : null;
  const upd = updatedAt ? fmt(updatedAt) : null;
  const showUpdated = upd && upd !== pub;

  return (
    <div className="flex items-center gap-3 py-4 border-y">
      <Avatar className="size-10 border-2 border-[#38a169]/20">
        <AvatarImage src={avatarUrl} alt={author} />
        <AvatarFallback className="bg-gradient-to-br from-[#1a365d] to-[#38a169] text-white text-xs font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold">{author}</p>
          <BadgeCheck className="size-3.5 text-[#38a169]" aria-label="Verified author" />
        </div>
        <p className="text-xs text-muted-foreground">{role}</p>
      </div>
      <div className="text-right text-xs text-muted-foreground space-y-0.5 shrink-0">
        {showUpdated ? (
          <>
            <p className="flex items-center justify-end gap-1 font-medium text-[#38a169]">
              <Calendar className="size-3" />
              Updated {upd}
            </p>
            {pub && <p className="opacity-60">Published {pub}</p>}
          </>
        ) : pub ? (
          <p className="flex items-center justify-end gap-1">
            <Calendar className="size-3" />
            Published {pub}
          </p>
        ) : null}
        {readTime && readTime > 0 && (
          <p className="opacity-60">{readTime} min read</p>
        )}
      </div>
    </div>
  );
}
