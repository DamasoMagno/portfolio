export type ImageObject = { key: string; body: Buffer; contentType: "image/webp" };
export interface ImageStorageRepository {
  put(image: ImageObject): Promise<{ key: string; url: string }>;
}
