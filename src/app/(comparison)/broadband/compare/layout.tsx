import type { Metadata } from "next";

export const metadata: Metadata = { title: "Compare broadband plans", robots: { index: false, follow: true } };

export default function ComparisonLayout({ children }: { children: React.ReactNode }) { return children; }
