import "server-only";
import type { PortfolioContent } from "../schemas/content";
import type { ContentRepository } from "./contracts";
import { storageProvider } from "@/modules/storage/services/config";
import { localContentRepository } from "./local-content-adapter";
import { SupabaseContentRepository } from "./supabase-content";
const supabaseContentRepository = new SupabaseContentRepository();
export function getContentRepository(): ContentRepository { return storageProvider() === "local" ? localContentRepository : supabaseContentRepository; }
export const readContent = () => getContentRepository().read();
export const mutateContent = (update: (content: PortfolioContent) => void, revision?: number) => getContentRepository().mutate(update, revision);
export { RevisionConflict } from "./errors";
