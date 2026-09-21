import { pageMetadata } from "@/config/seo";
import type { Metadata } from "next";
import { getCategoryBySlug } from "@/config/categories";
import { ComingSoon } from "@/components/shared/coming-soon";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  ...pageMetadata("/insurance", "Coming Soon - Insurance Comparison", "We're working on bringing you real insurance deals. Check back soon."),

};

export default function InsurancePage() {
  const category = getCategoryBySlug("insurance");
  if (!category) redirect("/");
  return <ComingSoon category={category} />;
}
