import type { MetadataRoute } from "next";
import { getSiteUrl, isPreviewDeployment } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  if (isPreviewDeployment()) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/backoffice"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
