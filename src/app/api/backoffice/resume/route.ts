import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { hasBackofficeAccess, sameOrigin } from "@/modules/backoffice/services/access";
import { readUploadForm } from "@/modules/media/services/multipart";
import { ImageValidationError } from "@/modules/media/services/errors";
import { RevisionConflict } from "@/modules/content/repositories/errors";
import { uploadResume } from "@/modules/resume/services/resume";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  if (!(await hasBackofficeAccess())) return NextResponse.json({ error: "Acesso administrativo necessário." }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem não autorizada." }, { status: 403 });
  try {
    const form = await readUploadForm(request, "currículo PDF");
    const files = form.getAll("file"), revisions = form.getAll("revision");
    if (files.length !== 1 || revisions.length !== 1 || typeof files[0] === "string" || typeof revisions[0] !== "string" || !/^\d+$/.test(revisions[0])) throw new ImageValidationError("Selecione o PDF e atualize a versão do perfil.");
    const data = await uploadResume(files[0], revisions[0]);
    return NextResponse.json({ data }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ImageValidationError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof RevisionConflict) return NextResponse.json({ error: error.message }, { status: 409 });
    if (error instanceof ZodError) return NextResponse.json({ error: "Versão do perfil inválida." }, { status: 400 });
    return NextResponse.json({ error: "Não foi possível enviar o currículo. Tente novamente." }, { status: 503 });
  }
}
