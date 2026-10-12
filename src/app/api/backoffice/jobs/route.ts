import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { hasBackofficeAccess, sameOrigin } from "@/modules/backoffice/services/access";
import { getBackofficeJobs, updateJobs } from "@/modules/jobs/services/jobs";
import { JobsConflict } from "@/modules/jobs/repositories/errors";
import { JobAIError } from "@/modules/jobs/services/ai-analysis";
export const maxDuration = 60;
export const runtime = "nodejs";
export async function GET() {
  if (!(await hasBackofficeAccess())) return NextResponse.json({ error: "Acesso administrativo necessário." }, { status: 401 });
  try { return NextResponse.json({ data: await getBackofficeJobs() }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ error: "Não foi possível carregar as vagas." }, { status: 503 }); }
}
export async function POST(request: Request) {
  if (!(await hasBackofficeAccess())) return NextResponse.json({ error: "Acesso administrativo necessário." }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem não autorizada." }, { status: 403 });
  try {
    if (Number(request.headers.get("content-length")) > 120000) return NextResponse.json({ error: "Conteúdo muito grande." }, { status: 413 });
    // Bound streamed requests as well, including those with no Content-Length.
    const reader = request.body?.getReader(); if (!reader) throw new Error("Envie os dados da vaga.");
    const chunks: Uint8Array[] = []; let bytes = 0;
    try { while (true) { const { done, value } = await reader.read(); if (done) break; bytes += value.byteLength; if (bytes > 120000) { await reader.cancel(); return NextResponse.json({ error: "Conteúdo muito grande." }, { status: 413 }); } chunks.push(value); } }
    finally { reader.releaseLock(); }
    const result = await updateJobs(JSON.parse(Buffer.concat(chunks).toString("utf8")));
    return NextResponse.json({ data: result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof JobAIError) return NextResponse.json({ error: error.message }, { status: 503 });
    if (error instanceof JobsConflict) return NextResponse.json({ error: error.message }, { status: 409 });
    if (error instanceof ZodError) return NextResponse.json({ error: error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
    return NextResponse.json({ error: "Não foi possível salvar ou analisar a vaga. Atualize e tente novamente." }, { status: 503 });
  }
}
