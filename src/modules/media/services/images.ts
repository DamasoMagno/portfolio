import "server-only";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { IMAGE_TYPES, MAX_IMAGE_BYTES, imagePurposeSchema, type UploadedImage } from "../schemas/image";
import { getImageRepository } from "../repositories/image-repository";
import type { ImageStorageRepository } from "../repositories/contracts";
import { ImageValidationError } from "./errors";

export type ImageFile = { type: string; size: number; arrayBuffer(): Promise<ArrayBuffer> };
export async function uploadImage(file: ImageFile, purpose: unknown, repository: ImageStorageRepository = getImageRepository()): Promise<UploadedImage> {
  const parsed = imagePurposeSchema.safeParse(purpose);
  if (!parsed.success) throw new ImageValidationError("Destino da imagem inválido.");
  if (file.size <= 0) throw new ImageValidationError("Selecione uma imagem válida.");
  if (file.size > MAX_IMAGE_BYTES) throw new ImageValidationError("A imagem deve ter no máximo 4 MB.", 413);
  if (!IMAGE_TYPES.includes(file.type as typeof IMAGE_TYPES[number])) throw new ImageValidationError("Use uma imagem JPEG, PNG, WebP ou AVIF.");
  const body = Buffer.from(await file.arrayBuffer());
  if (body.length !== file.size || body.length > MAX_IMAGE_BYTES) throw new ImageValidationError("Arquivo de imagem inválido.");
  let result;
  try {
    const image = sharp(body, { limitInputPixels: 20000000, failOn: "warning" });
    const metadata = await image.metadata();
    const expected = { "image/jpeg": "jpeg", "image/png": "png", "image/webp": "webp", "image/avif": "heif" }[file.type];
    if (!metadata.width || !metadata.height || metadata.format !== expected || (metadata.pages ?? 1) > 1) throw new Error();
    // Decode, orient and re-encode the image; extension/MIME alone are not trusted.
    result = await image.rotate().resize({ width: parsed.data === "profile" ? 1200 : 2400, height: parsed.data === "profile" ? 1200 : 2400, fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer({ resolveWithObject: true });
  } catch { throw new ImageValidationError("A imagem não pôde ser lida. Use um arquivo válido, sem animação, de até 20 megapixels."); }
  const key = `portfolio/${parsed.data}/${randomUUID()}.webp`;
  const uploaded = await repository.put({ key, body: result.data, contentType: "image/webp" });
  return { ...uploaded, width: result.info.width, height: result.info.height, bytes: result.data.length };
}
