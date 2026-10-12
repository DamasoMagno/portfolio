import "server-only";
import { randomUUID } from "node:crypto";
import { PDFDocument } from "pdf-lib";
import { z } from "zod";
import { MAX_IMAGE_BYTES } from "@/modules/media/schemas/image";
import { ImageValidationError } from "@/modules/media/services/errors";
import type { ImageFile } from "@/modules/media/services/images";
import { getContentRepository } from "@/modules/content/repositories/content-repository";
import { RevisionConflict } from "@/modules/content/repositories/errors";
import type { ResumeStorageRepository } from "../repositories/contracts";
import { getResumeRepository } from "../repositories/s3-resume";

export async function uploadResume(file: ImageFile, revision: unknown, storage: ResumeStorageRepository = getResumeRepository()) {
  const expected = z.coerce.number().int().nonnegative().parse(revision);
  if (file.type !== "application/pdf" || file.size <= 0) throw new ImageValidationError("Envie seu currículo em PDF.");
  if (file.size > MAX_IMAGE_BYTES) throw new ImageValidationError("O currículo deve ter no máximo 4 MB.", 413);
  const repository = getContentRepository();
  if ((await repository.read()).revision !== expected) throw new RevisionConflict();
  const body = Buffer.from(await file.arrayBuffer());
  if (body.length !== file.size || body.length > MAX_IMAGE_BYTES || !body.subarray(0, 5).equals(Buffer.from("%PDF-"))) throw new ImageValidationError("Arquivo PDF inválido.");
  try {
    const pdf = await PDFDocument.load(body, { updateMetadata: false, throwOnInvalidObject: true });
    if (pdf.getPageCount() < 1 || pdf.getPageCount() > 100) throw new Error();
    // A public CV should be a document, without executable actions or embedded files.
    if (pdf.context.enumerateIndirectObjects().some(([, object]) => /\/(JavaScript|JS|Launch|EmbeddedFile|RichMedia|OpenAction)\b/.test(object.toString()))) throw new Error();
  } catch { throw new ImageValidationError("Use um PDF válido, sem senha, ações automáticas ou arquivos anexados, de até 100 páginas."); }
  const uploaded = await storage.put({ key: `portfolio/resumes/${randomUUID()}.pdf`, body, contentType: "application/pdf" });
  try {
    return await repository.mutate(content => { content.profile.resume = uploaded.url; }, expected);
  } catch (error) {
    try { await storage.remove(uploaded.key); } catch { console.error("[resume] Não foi possível remover um upload não aplicado."); }
    throw error;
  }
}
