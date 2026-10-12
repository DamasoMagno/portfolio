import "server-only";
import { randomUUID } from "node:crypto";
import { getBackofficeContent } from "@/modules/content/services/content";
import { getBackofficePosts } from "@/modules/posts/services/posts";
import { getJobsRepository } from "../repositories/jobs-repository";
import { jobActionSchema } from "../schemas/job";
import { candidateSources } from "./candidate";
import { getJobAnalysisProvider } from "./ai-analysis";
import { JobsConflict } from "../repositories/errors";
import { analyzeJob } from "./analyzer";
export const getBackofficeJobs = () => getJobsRepository().read();
export async function updateJobs(input: unknown) {
  const action = jobActionSchema.parse(input);
  if (action.action === "analyze-ai") {
    const repository = getJobsRepository();
    const snapshot = await repository.read();
    if (snapshot.revision !== action.revision) throw new JobsConflict();
    const job = snapshot.jobs.find(item => item.id === action.id);
    if (!job) throw new Error("Vaga não encontrada.");
    const [content, posts] = await Promise.all([getBackofficeContent(), getBackofficePosts()]);
    const analysis = analyzeJob(job.data, content, posts);
    analysis.ai = await getJobAnalysisProvider().analyze(job.data, candidateSources(content, posts, job.data).sources);
    analysis.createdAt = analysis.ai.createdAt;
    return repository.mutate(action.revision, document => {
      const current = document.jobs.find(item => item.id === action.id);
      if (!current) throw new Error("Vaga não encontrada.");
      current.analyses = [analysis, ...current.analyses].slice(0, 10);
      current.updatedAt = analysis.createdAt;
    });
  }
  if (action.action === "analyze") {
    const [content, posts] = await Promise.all([getBackofficeContent(), getBackofficePosts()]);
    return getJobsRepository().mutate(action.revision, document => {
      const job = document.jobs.find(item => item.id === action.id);
      if (!job) throw new Error("Vaga não encontrada.");
      job.analyses = [analyzeJob(job.data, content, posts), ...job.analyses].slice(0, 10);
      job.updatedAt = job.analyses[0].createdAt;
    });
  }
  return getJobsRepository().mutate(action.revision, document => {
    const index = action.id ? document.jobs.findIndex(item => item.id === action.id) : -1;
    if (action.id && index < 0) throw new Error("Vaga não encontrada.");
    if (action.action === "delete") { document.jobs.splice(index, 1); return; }
    const existing = index >= 0 ? document.jobs[index] : undefined, now = new Date().toISOString();
    const saved = { id: existing?.id ?? randomUUID(), data: action.data, createdAt: existing?.createdAt ?? now, updatedAt: now, analyses: existing?.analyses ?? [] };
    if (existing) document.jobs[index] = saved; else document.jobs.unshift(saved);
  });
}
