import type { JobSource, Opportunity } from "../schemas/discovery";
export interface JobFeedProvider {
  readonly source: JobSource;
  fetchJobs(now: Date): Promise<Opportunity[]>;
}
