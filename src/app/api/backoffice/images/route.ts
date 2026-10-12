import { NextResponse } from "next/server";
import { hasBackofficeAccess, sameOrigin } from "@/modules/backoffice/services/access";
import { uploadImage, type ImageFile } from "@/modules/media/services/images";
import { readImageForm } from "@/modules/media/services/multipart";
import { ImageValidationError } from "@/modules/media/services/errors";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!(await hasBackofficeAccess())) return NextResponse.json({ error: "Acesso administrativo necessário." }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem não autorizada." }, { status: 403 });
  try {
    const form = await readImageForm(request);
    const files = form.getAll("file"), purposes = form.getAll("purpose");
    const file = files[0];
    if (files.length !== 1 || purposes.length !== 1 || !file || typeof file === "string") throw new ImageValidationError("Selecione uma imagem e seu destino.");
    const image = await uploadImage(file as ImageFile, purposes[0]);
    return NextResponse.json({ data: image }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ImageValidationError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("[images] Não foi possível concluir o upload.");
    return NextResponse.json({ error: "Não foi possível enviar a imagem. Tente novamente." }, { status: 503 });
  }
}
