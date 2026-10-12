import { NextResponse } from "next/server";
import { publicPosts } from "@/modules/posts/services/posts";
export const dynamic = "force-dynamic";
export async function GET() {
  try { return NextResponse.json({ data: await publicPosts() }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ error: "Não foi possível carregar os posts." }, { status: 503 }); }
}
