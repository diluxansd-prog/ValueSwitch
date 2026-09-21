import type { Metadata } from "next";

// Coming-soon sections should not compete with complete comparison pages.
export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function ComingSoonLayout({ children }: { children: React.ReactNode }) { return children; }
