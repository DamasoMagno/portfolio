import "server-only";
import { z } from "zod";
import { supabaseRequest } from "@/modules/storage/services/supabase";
import { emptyJobs, jobsDocumentSchema, type JobsDocument } from "../schemas/job";
import type { JobsRepository } from "./contracts";
import { JobsConflict } from "./errors";
const rowsSchema = z.array(z.object({ body: jobsDocumentSchema, revision: z.number().int().positive() })).max(1);
export class SupabaseJobsRepository implements JobsRepository {
  async read(): Promise<JobsDocument> {
    const rows = rowsSchema.parse(await supabaseRequest("portfolio_jobs?id=eq.true&select=body,revision&limit=1"));
    if (!rows.length) return emptyJobs();
    if (rows[0].revision !== rows[0].body.revision) throw new Error("Documento de vagas inválido. Os dados foram preservados.");
    return rows[0].body;
  }
  async mutate(revision: number, update: (document: JobsDocument) => void) {
    const document = await this.read();
    if (document.revision !== revision) throw new JobsConflict();
    update(document); document.revision++;
    const body = jobsDocumentSchema.parse(document);
    if (!z.boolean().parse(await supabaseRequest("rpc/portfolio_save_jobs", { method: "POST", body: { p_expected_revision: revision, p_body: body } }))) throw new JobsConflict();
    return body;
  }
}
