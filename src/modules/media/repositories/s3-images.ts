import "server-only";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Config } from "../services/s3-config";
import type { ImageObject, ImageStorageRepository } from "./contracts";

export function createS3Client() {
  const config = s3Config();
  return new S3Client({
    endpoint: config.endpoint, region: config.region, forcePathStyle: true,
    credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
    // Supabase S3 does not implement every optional checksum feature of AWS S3.
    requestChecksumCalculation: "WHEN_REQUIRED", responseChecksumValidation: "WHEN_REQUIRED", maxAttempts: 2,
  });
}

export class S3ImageStorageRepository implements ImageStorageRepository {
  async put(image: ImageObject) {
    const config = s3Config();
    const client = createS3Client();
    try {
      await client.send(new PutObjectCommand({ Bucket: config.bucket, Key: image.key, Body: image.body,
        ContentType: image.contentType, ContentLength: image.body.length, CacheControl: "public, max-age=31536000, immutable" }), { abortSignal: AbortSignal.timeout(30000) });
      return { key: image.key, url: `${config.publicUrl}/${image.key.split("/").map(encodeURIComponent).join("/")}` };
    } catch { throw new Error("Não foi possível enviar a imagem ao armazenamento. Tente novamente."); }
    finally { client.destroy(); }
  }
}
