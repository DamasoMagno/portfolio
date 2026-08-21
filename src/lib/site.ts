export const SITE_NAME = "Damaso Magno";

export const SITE_TITLE = "Damaso Magno | Desenvolvedor Full Stack";

export const SITE_DESCRIPTION =
  "Desenvolvedor Full Stack no Brasil (remoto). Atuo com React, Next.js, React Native, Node.js, Nest, Java 17 e Spring Boot — web, mobile e APIs.";

export const SITE_KEYWORDS = [
  "Damaso Magno",
  "Desenvolvedor Full Stack",
  "React",
  "Next.js",
  "React Native",
  "Expo",
  "Node.js",
  "NestJS",
  "Java",
  "Spring Boot",
  "TypeScript",
  "Portfólio",
];

export const SOCIAL = {
  github: "https://github.com/DamasoMagno",
  linkedin: "https://www.linkedin.com/in/damasomagno/",
} as const;

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (explicit) return explicit;

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production}`;

  const preview = process.env.VERCEL_URL;
  if (preview) return `https://${preview}`;

  return "http://localhost:3000";
}

export function personJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: SITE_NAME,
        url: siteUrl,
        image: `${siteUrl}/avatar.jpg`,
        jobTitle: "Desenvolvedor Full Stack",
        description: SITE_DESCRIPTION,
        sameAs: [SOCIAL.github, SOCIAL.linkedin],
        knowsAbout: [
          "React",
          "Next.js",
          "React Native",
          "TypeScript",
          "Node.js",
          "NestJS",
          "Java",
          "Spring Boot",
        ],
        address: {
          "@type": "PostalAddress",
          addressCountry: "BR",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: SITE_TITLE,
        description: SITE_DESCRIPTION,
        inLanguage: "pt-BR",
        publisher: { "@id": `${siteUrl}/#person` },
      },
    ],
  };
}
