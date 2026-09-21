import { pageMetadata } from "@/config/seo";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
  ...pageMetadata("/business", "Coming Soon - Business Comparison", "Business comparison services coming soon."),

};

export default function BusinessPage() {
  redirect("/");
}
