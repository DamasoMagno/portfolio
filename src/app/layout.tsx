import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Damaso Magno - Full Stack Developer",
  description: "Portfólio de Damaso Magno, Desenvolvedor Full Stack com foco em React, Next.js, React Native, Expo e Node.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-inter antialiased">{children}</body>
    </html>
  );
}
