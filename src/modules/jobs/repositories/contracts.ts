import type { JobsDocument } from "../schemas/job";
export interface JobsRepository {
  read(): Promise<JobsDocument>;
  mutate(revision: number, update: (document: JobsDocument) => void): Promise<JobsDocument>;
}
