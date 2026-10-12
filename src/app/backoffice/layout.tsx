import type { Metadata } from "next";
export const metadata: Metadata = { title: "Backoffice", alternates: { canonical: null }, robots: { index: false, follow: false, googleBot: { index: false, follow: false } } };
export const dynamic = "force-dynamic";
export default function BackofficeLayout({ children }: { children: React.ReactNode }) { return children; }
