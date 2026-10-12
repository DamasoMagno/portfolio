import "server-only";
import type { ImageStorageRepository } from "./contracts";
import { S3ImageStorageRepository } from "./s3-images";
const repository: ImageStorageRepository = new S3ImageStorageRepository();
export function getImageRepository(): ImageStorageRepository { return repository; }
