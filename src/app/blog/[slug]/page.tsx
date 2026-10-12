import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3 } from "lucide-react";
import { publicPosts } from "@/modules/posts/services/posts";
import { publicContent } from "@/modules/content/services/content";
import { PostMarkdown } from "@/modules/posts/components/markdown";
import { readingMinutes } from "@/modules/posts/schemas/post";
import { getSiteUrl } from "@/lib/site";
import { AnalyticsTracker } from "@/modules/analytics/components/tracker";
export const dynamic = "force-dynamic";
async function findPost(slug: string) { const { posts } = await publicPosts(); const post = posts.find(post => post.slug === slug); if (!post) notFound(); return post; }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = await findPost((await params).slug);
  const { profile } = await publicContent();
  return { title: post.title, description: post.excerpt, alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt, url: `/blog/${post.slug}`, publishedTime: post.publishedAt!, modifiedTime: post.updatedAt, authors: [profile.name], ...(post.cover ? { images: [{ url: post.cover }] } : {}) },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt, ...(post.cover ? { images: [post.cover] } : {}) },
  };
}
export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = await findPost((await params).slug); const { profile } = await publicContent();
  const jsonLd = { "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: post.excerpt, datePublished: post.publishedAt, dateModified: post.updatedAt,
    author: { "@type": "Person", name: profile.name, url: getSiteUrl() }, mainEntityOfPage: `${getSiteUrl()}/blog/${post.slug}`, ...(post.cover ? { image: new URL(post.cover, getSiteUrl()).toString() } : {}) };
  return <main className="min-h-screen bg-background px-6 py-12 sm:py-20">{process.env.ANALYTICS_ENABLED !== "false" && <AnalyticsTracker />}<article className="mx-auto max-w-[800px]"><Link href="/blog" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-white"><ArrowLeft size={16} />Todos os posts</Link><div className="mb-5 mt-12 flex flex-wrap gap-2">{post.tags.map(tag => <Link href={`/blog?tag=${encodeURIComponent(tag)}`} key={tag} className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">{tag}</Link>)}</div><h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{post.title}</h1><p className="mt-6 text-xl leading-8 text-text-secondary">{post.excerpt}</p><div className="my-8 flex flex-wrap items-center gap-4 text-xs text-text-secondary"><img src={profile.avatar} alt="" className="h-9 w-9 rounded-full object-cover" /><span>{profile.name}</span><time dateTime={post.publishedAt!}>{new Date(post.publishedAt!).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</time><span className="inline-flex items-center gap-1"><Clock3 size={14} />{readingMinutes(post.body)} min de leitura</span></div>{post.cover && <img src={post.cover} alt="" className="mb-10 max-h-[440px] w-full rounded-2xl object-cover" />}<PostMarkdown body={post.body} /><div className="mt-12 border-t border-white/10 pt-6"><Link href="/#contact" className="text-sm text-primary">Vamos conversar sobre seu próximo projeto?</Link></div></article><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /></main>;
}
