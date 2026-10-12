import { publicPosts } from "@/modules/posts/services/posts";
import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const blog = await publicPosts();

  return [
    ...(blog.enabled ? [{ url: `${siteUrl}/blog`, changeFrequency: "weekly" as const, priority: 0.7 }, ...blog.posts.map(post => ({ url: `${siteUrl}/blog/${post.slug}`, lastModified: new Date(post.updatedAt), changeFrequency: "monthly" as const, priority: 0.6 }))] : []),
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
