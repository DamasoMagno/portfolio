import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { hasBackofficeAccess, sameOrigin } from "@/modules/backoffice/services/access";
import { PostsConflict } from "@/modules/posts/repositories/errors";
import { getBackofficePosts } from "@/modules/posts/services/posts";
import { updatePosts } from "@/modules/posts/services/posts";
export async function GET() {
  if (!(await hasBackofficeAccess())) return NextResponse.json({ error: "Acesso administrativo necessário." }, { status: 401 });
  try { return NextResponse.json({ data: await getBackofficePosts() }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ error: "Não foi possível carregar os posts." }, { status: 500 }); }
}
export async function POST(request: Request) {
  if (!(await hasBackofficeAccess())) return NextResponse.json({ error: "Acesso administrativo necessário." }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem não autorizada." }, { status: 403 });
  if (Number(request.headers.get("content-length")) > 150000) return new NextResponse(null, { status: 413 });
  try {
    const raw = await request.text();
    if (raw.length > 150000) return new NextResponse(null, { status: 413 });
    return NextResponse.json({ data: await updatePosts(JSON.parse(raw)) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof ZodError ? error.issues[0]?.message : error instanceof Error ? error.message : "Não foi possível salvar o post." }, { status: error instanceof PostsConflict ? 409 : 400 });
  }
}
