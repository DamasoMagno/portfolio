import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { hasBackofficeAccess, sameOrigin } from "@/modules/backoffice/services/access";
import { RevisionConflict } from "@/modules/content/repositories/errors";
import { getBackofficeContent } from "@/modules/content/services/content";
import { updateCollection, updateProfile } from "@/modules/content/services/content";
import { collectionSchemas, type ContentResource } from "@/modules/content/schemas/content";
import { updateMessage } from "@/modules/messages/services/messages";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ resource: string }> };
export async function GET() {
  if (!(await hasBackofficeAccess())) return NextResponse.json({ error: "Acesso restrito." }, { status: 401 });
  try { return NextResponse.json({ data: await getBackofficeContent() }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ error: "Não foi possível carregar o conteúdo salvo." }, { status: 500 }); }
}
export async function POST(request: Request, { params }: Context) {
  if (!(await hasBackofficeAccess())) return NextResponse.json({ error: "Acesso restrito." }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem não autorizada." }, { status: 403 });
  try {
    if (Number(request.headers.get("content-length")) > 250000) return NextResponse.json({ error: "Conteúdo muito grande." }, { status: 413 });
    const body = await request.json();
    const { resource } = await params;
    const data = resource === "profile" ? await updateProfile(body) : resource === "messages" ? await updateMessage(body) : Object.hasOwn(collectionSchemas, resource) ? await updateCollection(resource as ContentResource, body) : null;
    if (!data) return NextResponse.json({ error: "Recurso não encontrado." }, { status: 404 });
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof RevisionConflict) return NextResponse.json({ error: error.message }, { status: 409 });
    if (error instanceof ZodError) return NextResponse.json({ error: error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
    return NextResponse.json({ error: "Não foi possível salvar. Confira os dados e tente novamente." }, { status: 400 });
  }
}
