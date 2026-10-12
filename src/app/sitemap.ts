import { getBackofficeContent } from "@/modules/content/services/content";
import { publicPosts } from "@/modules/posts/services/posts";
import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [blog, content] = await Promise.all([publicPosts(), getBackofficeContent()]);
  const dates = [content.updatedAt, ...blog.posts.map(post => post.updatedAt)].filter((date): date is string => Boolean(date));
  const lastModified = dates.length ? new Date(Math.max(...dates.map(date => Date.parse(date)))) : undefined;

  return [
    ...(blog.enabled ? [{ url: `${siteUrl}/blog`, changeFrequency: "weekly" as const, priority: 0.7 }, ...blog.posts.map(post => ({ url: `${siteUrl}/blog/${post.slug}`, lastModified: new Date(post.updatedAt), changeFrequency: "monthly" as const, priority: 0.6 }))] : []),
    {
      url: siteUrl,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
