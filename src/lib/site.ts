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
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const hosted = production || process.env.VERCEL_URL;
  const candidate = explicit || (hosted ? `https://${hosted}` : "http://localhost:3000");
  const url = new URL(candidate);
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new Error("Configure NEXT_PUBLIC_SITE_URL com a origem pública do portfólio.");
  if (process.env.VERCEL_ENV === "production" && (url.protocol !== "https:" || ["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname))) throw new Error("Use o domínio HTTPS público em produção.");
  return url.origin;
}
export const isPreviewDeployment = () => process.env.VERCEL_ENV === "preview";
export function seoText(value: string, max = 180) {
  const text = value.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_#`]/g, "").replace(/\s+/g, " ").trim();
  return text.length <= max ? text : `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

export function personJsonLd(siteUrl: string, profile?: import("@/modules/content/schemas/content").Profile, skills?: import("@/modules/content/schemas/content").SkillGroup[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: profile?.name ?? SITE_NAME,
        url: siteUrl,
        image: profile ? new URL(profile.avatar, siteUrl).toString() : `${siteUrl}/avatar.jpg`,
        jobTitle: profile?.headline ?? "Desenvolvedor Full Stack",
        description: profile?.intro ?? SITE_DESCRIPTION,
        sameAs: profile ? [profile.github, profile.linkedin].filter(Boolean) : [SOCIAL.github, SOCIAL.linkedin],
        knowsAbout: skills ? Array.from(new Set(skills.flatMap(skill => skill.tags))) : [
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
        name: profile ? `${profile.name} | ${profile.headline}` : SITE_TITLE,
        description: profile?.intro ?? SITE_DESCRIPTION,
        inLanguage: "pt-BR",
        publisher: { "@id": `${siteUrl}/#person` },
      },
    ],
  };
}
