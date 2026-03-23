import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Coming Soon - Business Comparison",
  description: "Business comparison services coming soon.",
};

export default function BusinessPage() {
  redirect("/");
}
