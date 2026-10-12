import "server-only";
import { storageProvider } from "@/modules/storage/services/config";
import { localJobsRepository } from "./local-jobs";
import { SupabaseJobsRepository } from "./supabase-jobs";
import type { JobsRepository } from "./contracts";
const supabase = new SupabaseJobsRepository();
export const getJobsRepository = (): JobsRepository => storageProvider() === "local" ? localJobsRepository : supabase;
