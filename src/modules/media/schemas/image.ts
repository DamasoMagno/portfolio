import { z } from "zod";
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const MAX_UPLOAD_BYTES = MAX_IMAGE_BYTES + 64 * 1024;
export const imagePurposeSchema = z.enum(["profile", "projects", "posts"]);
export type ImagePurpose = z.infer<typeof imagePurposeSchema>;
export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export type UploadedImage = { key: string; url: string; width: number; height: number; bytes: number };
