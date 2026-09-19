export default function ComparisonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <><ComparisonNav />{children}</>;
}
import { ComparisonNav } from "@/components/layout/comparison-nav";
