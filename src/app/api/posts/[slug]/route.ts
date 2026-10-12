import { NextResponse } from "next/server";
import { publicPosts } from "@/modules/posts/services/posts";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { posts } = await publicPosts();
    const { slug } = await params;
    const post = posts.find(item => item.slug === slug);
    if (!post) return NextResponse.json({ error: "Post não encontrado." }, { status: 404 });
    return NextResponse.json({ data: post }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Não foi possível carregar o post." }, { status: 503 }); }
}
