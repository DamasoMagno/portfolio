import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { publicPosts } from "@/modules/posts/services/posts";
import { PostCards } from "@/modules/posts/components/post-cards";
import { AnalyticsTracker } from "@/modules/analytics/components/tracker";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Posts", description: "Artigos e aprendizados sobre desenvolvimento e projetos.", alternates: { canonical: "/blog" }, openGraph: { title: "Posts", url: "/blog", description: "Artigos e aprendizados sobre desenvolvimento e projetos." } };
export default async function BlogPage({ searchParams }: { searchParams: Promise<{ tag?: string; q?: string }> }) {
  const content = await publicPosts();
  if (!content.enabled) notFound();
  const tag = (await searchParams).tag?.slice(0, 60) ?? "";
  const search = (await searchParams).q?.slice(0, 200) ?? "";
  const posts = content.posts.filter(post => (!tag || post.tags.includes(tag)) && `${post.title} ${post.excerpt} ${post.tags.join(" ")}`.toLowerCase().includes(search.toLowerCase()));
  const tags = Array.from(new Set(content.posts.flatMap(post => post.tags))).sort();
  return <main className="min-h-screen bg-background px-6 py-12 sm:py-20">{process.env.ANALYTICS_ENABLED !== "false" && <AnalyticsTracker />}<div className="mx-auto max-w-[1280px]"><Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-white"><ArrowLeft size={16} />Voltar ao portfólio</Link><p className="mt-12 text-xs uppercase tracking-widest text-primary">Ideias e aprendizados</p><h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Posts</h1><p className="mt-5 max-w-xl text-text-secondary">Experiências, soluções e reflexões que compartilho ao longo dos meus projetos.</p><form className="my-8 flex max-w-xl gap-3" action="/blog"><input type="search" name="q" aria-label="Buscar artigos" defaultValue={search} placeholder="Buscar artigos…" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#18181b] px-4 py-3 text-sm outline-none focus:border-primary" />{tag && <input type="hidden" name="tag" value={tag} />}<button className="rounded-xl bg-primary px-4 text-sm text-white">Buscar</button></form>{tags.length > 0 && <nav aria-label="Tags dos posts" className="mb-10 flex flex-wrap gap-2">{["", ...tags].map(value => <Link key={value} href={`/blog${value ? `?tag=${encodeURIComponent(value)}` : ""}`} className={`rounded-full border px-4 py-2 text-xs ${tag === value ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 text-text-secondary"}`}>{value || "Todos"}</Link>)}</nav>}{posts.length ? <PostCards posts={posts} /> : <p className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-sm text-text-secondary">{search || tag ? "Nenhum artigo encontrado para este filtro." : "Os primeiros artigos serão publicados em breve."}</p>}</div></main>;
}
