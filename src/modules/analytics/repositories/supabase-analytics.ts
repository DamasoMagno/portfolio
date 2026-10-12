import type { AnalyticsRepository } from "./contracts";
import "server-only";
import { z } from "zod";
import { supabaseRequest } from "@/modules/storage/services/supabase";
import { eventSchema, type AnalyticsEvent, type StoredEvent } from "../schemas/event";
const recordsSchema = z.array(z.object({ payload: eventSchema, createdAt: z.string().datetime({ offset: true }) })).max(50000);

export class SupabaseAnalyticsRepository implements AnalyticsRepository {
  async read(now = Date.now()): Promise<StoredEvent[]> {
    const records = recordsSchema.parse(await supabaseRequest("rpc/portfolio_read_events", { method: "POST", body: {} }));
    return records.filter(event => Date.parse(event.createdAt) >= now - 90 * 86400000 && Date.parse(event.createdAt) <= now).map(({ payload, createdAt }) => ({ ...payload, createdAt: new Date(createdAt).toISOString() }));
  }
  async record(payload: AnalyticsEvent): Promise<void> {
    const validated = eventSchema.parse(payload);
    await supabaseRequest("rpc/portfolio_record_event", { method: "POST", body: { p_payload: validated } });
  }
}
