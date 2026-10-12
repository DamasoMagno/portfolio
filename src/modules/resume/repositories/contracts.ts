import type { ImageStorageRepository } from "@/modules/media/repositories/contracts";
export interface ResumeStorageRepository extends ImageStorageRepository {
  remove(key: string): Promise<void>;
}
