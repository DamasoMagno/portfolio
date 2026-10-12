import "server-only";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { emptyJobs, jobsDocumentSchema } from "../schemas/job";
import type { JobsRepository } from "./contracts";
import { JobsConflict } from "./errors";
const state = globalThis as typeof globalThis & { portfolioJobsQueue?: Promise<unknown> };
export const jobsPath = () => path.resolve(process.env.PORTFOLIO_JOBS_FILE || path.join(process.cwd(), ".data", "jobs.json"));
export const localJobsRepository: JobsRepository = {
  async read() {
    try { return jobsDocumentSchema.parse(JSON.parse(await readFile(jobsPath(), "utf8"))); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return emptyJobs(); throw error; }
  },
  mutate(revision, update) {
    const operation = (state.portfolioJobsQueue ?? Promise.resolve()).catch(() => undefined).then(async () => {
      const document = await localJobsRepository.read();
      if (document.revision !== revision) throw new JobsConflict();
      update(document); document.revision++;
      const validated = jobsDocumentSchema.parse(document), destination = jobsPath();
      await mkdir(path.dirname(destination), { recursive: true, mode: 0o700 });
      const temporary = `${destination}.${randomUUID()}.tmp`;
      try { await writeFile(temporary, JSON.stringify(validated, null, 2), { mode: 0o600 }); await rename(temporary, destination); }
      catch (error) { await unlink(temporary).catch(() => undefined); throw error; }
      return validated;
    });
    state.portfolioJobsQueue = operation; return operation;
  },
};
