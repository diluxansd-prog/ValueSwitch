"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));
    toast.success("You're subscribed! We'll send you the best deals.");
    setEmail("");
    setLoading(false);
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-white mb-2">Get Deal Alerts</h3>
      <p className="text-xs text-white/60 mb-3">
        Weekly deals and savings tips straight to your inbox.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-9 bg-white/10 border-white/20 text-white placeholder:text-white/40 text-sm"
        />
        <Button
          type="submit"
          size="sm"
          disabled={loading}
          className="shrink-0 bg-[#38a169] text-white hover:bg-[#48bb78]"
        >
          <Send className="size-3.5" />
        </Button>
      </form>
    </div>
  );
}
