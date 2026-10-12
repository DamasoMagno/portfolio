import { publicContent } from "@/modules/content/services/content";
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TITLE,
  getSiteUrl,
  personJsonLd,
} from "@/lib/site";

const siteUrl = getSiteUrl();
export const dynamic = "force-dynamic";

const baseMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME, url: siteUrl }],
  creator: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: "/avatar.jpg",
    apple: "/avatar.jpg",
  },
  other: {
    "impact-site-verification": "e16bf2cd-e912-46b9-a99a-f306585972e5",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await publicContent();
  const title = `${profile.name} | ${profile.headline}`;
  return { ...baseMetadata, title: { default: title, template: `%s | ${profile.name}` }, description: profile.intro,
    authors: [{ name: profile.name, url: siteUrl }], creator: profile.name,
    openGraph: { ...baseMetadata.openGraph, title, description: profile.intro, siteName: profile.name },
    twitter: { ...baseMetadata.twitter, title, description: profile.intro },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { profile } = await publicContent();
  const jsonLd = personJsonLd(siteUrl, profile);

  return (
    <html lang="pt-BR">
      <body className="font-inter antialiased">
        {children}
        <Script
          id="person-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
