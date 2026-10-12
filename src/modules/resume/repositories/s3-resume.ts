import "server-only";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { S3ImageStorageRepository, createS3Client } from "@/modules/media/repositories/s3-images";
import { s3Config } from "@/modules/media/services/s3-config";
import type { ResumeStorageRepository } from "./contracts";
export class S3ResumeRepository extends S3ImageStorageRepository implements ResumeStorageRepository {
  async remove(key: string) {
    const client = createS3Client();
    try { await client.send(new DeleteObjectCommand({ Bucket: s3Config().bucket, Key: key }), { abortSignal: AbortSignal.timeout(15000) }); }
    finally { client.destroy(); }
  }
}
export const getResumeRepository = (): ResumeStorageRepository => new S3ResumeRepository();
