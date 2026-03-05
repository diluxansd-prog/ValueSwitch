"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!visible) return null;

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className="fixed bottom-6 right-6 z-50 size-10 rounded-full bg-gradient-to-br from-[#1a365d] to-[#38a169] text-white shadow-lg transition-all hover:from-[#2a4a7f] hover:to-[#48bb78] hover:shadow-xl"
      aria-label="Back to top"
    >
      <ArrowUp className="size-5" />
    </Button>
  );
}
