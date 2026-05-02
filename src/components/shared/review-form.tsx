"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Star, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ReviewFormProps {
  providerSlug: string;
  providerName: string;
}

export function ReviewForm({ providerSlug, providerName }: ReviewFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!session?.user) {
    // Logged-out users see a sign-in CTA instead
    return (
      <Card className="border-dashed">
        <CardContent className="p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <MessageSquare className="size-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm font-medium">
                Used {providerName}? Help other shoppers.
              </p>
              <p className="text-xs text-muted-foreground">
                Sign in to leave a verified review.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!open) {
    return (
      <Card>
        <CardContent className="p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <MessageSquare className="size-5 text-[#38a169] shrink-0" />
            <div>
              <p className="text-sm font-medium">Share your experience</p>
              <p className="text-xs text-muted-foreground">
                Tell other shoppers what {providerName} was like for you
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setOpen(true)}
            className="bg-[#1a365d] text-white hover:bg-[#2a4a7f]"
          >
            Write a review
          </Button>
        </CardContent>
      </Card>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please pick a star rating");
      return;
    }
    if (content.trim().length < 10) {
      toast.error("Review must be at least 10 characters");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerSlug,
          rating,
          title: title.trim() || undefined,
          content: content.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Thanks for your review!");
      setOpen(false);
      setRating(0);
      setTitle("");
      setContent("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save review");
    }
    setSubmitting(false);
  }

  return (
    <Card>
      <CardContent className="p-5">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <h3 className="text-base font-semibold mb-1">
              Review {providerName}
            </h3>
            <p className="text-xs text-muted-foreground">
              Posting as <span className="font-medium">{session.user.name}</span>
              . Be honest and specific — others rely on this.
            </p>
          </div>

          {/* Star rating */}
          <div>
            <Label className="text-sm">Your rating *</Label>
            <div
              className="mt-1.5 flex items-center gap-1"
              onMouseLeave={() => setHover(0)}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  aria-label={`${n} star${n === 1 ? "" : "s"}`}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={cn(
                      "size-7 transition-colors",
                      (hover || rating) >= n
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    )}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm font-medium">
                  {rating}/5
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-sm">
              Title <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Great coverage but slow customer service"
              maxLength={120}
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <Label htmlFor="content" className="text-sm">
              Review *
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's it really like? Coverage, speed, customer support, billing surprises..."
              rows={5}
              maxLength={2000}
            />
            <p className="text-[11px] text-muted-foreground text-right">
              {content.length}/2000
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || rating === 0 || content.trim().length < 10}
              className="bg-gradient-to-r from-[#1a365d] to-[#38a169] text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post review"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
