import type { Metadata } from "next";
import { LinkGenerator } from "@/components/admin/link-generator";

export const metadata: Metadata = {
  title: "Affiliate Link Generator | Admin | ValueSwitch",
};

export default function AdminLinksPage() {
  return <LinkGenerator />;
}
