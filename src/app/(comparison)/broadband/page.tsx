import type { Metadata } from "next";
import { getCategoryBySlug } from "@/config/categories";
import { ComingSoon } from "@/components/shared/coming-soon";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Coming Soon - Broadband Comparison",
  description: "We're working on bringing you real broadband deals. Check back soon.",
};

export default function BroadbandPage() {
  const category = getCategoryBySlug("broadband");
  if (!category) redirect("/");
  return <ComingSoon category={category} />;
}
