import type { Metadata } from "next";
import { getCategoryBySlug } from "@/config/categories";
import { ComingSoon } from "@/components/shared/coming-soon";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Coming Soon - Energy Comparison",
  description: "We're working on bringing you real energy deals. Check back soon.",
};

export default function EnergyPage() {
  const category = getCategoryBySlug("energy");
  if (!category) redirect("/");
  return <ComingSoon category={category} />;
}
