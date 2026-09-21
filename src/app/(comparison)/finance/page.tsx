import { pageMetadata } from "@/config/seo";
import type { Metadata } from "next";
import { getCategoryBySlug } from "@/config/categories";
import { ComingSoon } from "@/components/shared/coming-soon";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  ...pageMetadata("/finance", "Coming Soon - Finance Comparison", "We're working on bringing you real finance deals. Check back soon."),

};

export default function FinancePage() {
  const category = getCategoryBySlug("finance");
  if (!category) redirect("/");
  return <ComingSoon category={category} />;
}
