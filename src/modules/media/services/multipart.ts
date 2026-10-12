import "server-only";
import { MAX_UPLOAD_BYTES } from "../schemas/image";
import { ImageValidationError } from "./errors";

export async function readImageForm(request: Request): Promise<FormData> {
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data")) throw new ImageValidationError("Envie a imagem como formulário multipart.");
  if (Number(request.headers.get("content-length")) > MAX_UPLOAD_BYTES) throw new ImageValidationError("A imagem deve ter no máximo 4 MB.", 413);
  if (!request.body) throw new ImageValidationError("Selecione uma imagem.");
  const reader = request.body.getReader(); const chunks: Uint8Array[] = []; let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_UPLOAD_BYTES) { await reader.cancel(); throw new ImageValidationError("A imagem deve ter no máximo 4 MB.", 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try { return await new Response(Buffer.concat(chunks), { headers: { "Content-Type": request.headers.get("content-type")! } }).formData(); }
  catch { throw new ImageValidationError("Formulário de imagem inválido."); }
}
