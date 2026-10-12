import "server-only";
import type { AnalyticsEvent, StoredEvent } from "../schemas/event";
import type { AnalyticsRepository } from "./contracts";
import { storageProvider } from "@/modules/storage/services/config";
import { localAnalyticsRepository } from "./local-analytics-adapter";
import { SupabaseAnalyticsRepository } from "./supabase-analytics";
const supabaseAnalyticsRepository = new SupabaseAnalyticsRepository();
export function getAnalyticsRepository(): AnalyticsRepository { return storageProvider() === "local" ? localAnalyticsRepository : supabaseAnalyticsRepository; }
export const readEvents = (now?: number) => getAnalyticsRepository().read(now);
export const recordEvent = (payload: AnalyticsEvent) => getAnalyticsRepository().record(payload);
