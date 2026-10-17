import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { hasBackofficeAccess, sameOrigin } from "@/modules/backoffice/services/access";
import { getBackofficeContent } from "@/modules/content/services/content";
import { JobsConflict } from "@/modules/jobs/repositories/errors";
import { DiscoveryError, getJobDiscovery, updateDiscovery } from "@/modules/jobs/services/discovery";
export const runtime = "nodejs";
export const maxDuration = 60;
const headers = { "Cache-Control": "no-store" };
export async function GET() {
  if (!(await hasBackofficeAccess())) return NextResponse.json({ error: "Acesso administrativo necessário." }, { status: 401, headers });
  try { return NextResponse.json(await getJobDiscovery(), { headers }); }
  catch { return NextResponse.json({ error: "Não foi possível carregar a busca de vagas." }, { status: 503, headers }); }
}
export async function POST(request: Request) {
  if (!(await hasBackofficeAccess())) return NextResponse.json({ error: "Acesso administrativo necessário." }, { status: 401, headers });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem não autorizada." }, { status: 403, headers });
  try {
    if (Number(request.headers.get("content-length")) > 20000) return NextResponse.json({ error: "Conteúdo muito grande." }, { status: 413, headers });
    const reader = request.body?.getReader(); if (!reader) return NextResponse.json({ error: "Envie a ação desejada." }, { status: 400, headers });
    const chunks: Uint8Array[] = []; let size = 0;
    try { while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > 20000) { await reader.cancel(); return NextResponse.json({ error: "Conteúdo muito grande." }, { status: 413, headers }); } chunks.push(value); } }
    finally { reader.releaseLock(); }
    const result = await updateDiscovery(JSON.parse(Buffer.concat(chunks).toString("utf8")));
    return NextResponse.json({ ...result, skills: (await getBackofficeContent()).skills }, { headers });
  } catch (error) {
    if (error instanceof JobsConflict) return NextResponse.json({ error: error.message }, { status: 409, headers });
    if (error instanceof DiscoveryError) return NextResponse.json({ error: error.message }, { status: 400, headers });
    if (error instanceof ZodError || error instanceof SyntaxError) return NextResponse.json({ error: "Preferências inválidas. Confira os campos." }, { status: 400, headers });
    return NextResponse.json({ error: "Não foi possível concluir a busca. Seus dados foram preservados." }, { status: 503, headers });
  }
}
