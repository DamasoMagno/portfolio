import type { Metadata } from "next";
export const metadata: Metadata = { title: "Backoffice", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default function BackofficeLayout({ children }: { children: React.ReactNode }) { return children; }
