import "server-only";
import { PublicJobFeedProvider } from "./public-feeds";
import { GitHubJobFeedProvider } from "./github-feeds";
import type { JobFeedProvider } from "./contracts";
export const getJobFeedProviders = (): JobFeedProvider[] => [new GitHubJobFeedProvider("frontendbr"), new GitHubJobFeedProvider("backendbr"), new PublicJobFeedProvider("remotive"), new PublicJobFeedProvider("arbeitnow")];
