import type { AnalyticsEvent, StoredEvent } from "../schemas/event";
export interface AnalyticsRepository {
  read(now?: number): Promise<StoredEvent[]>;
  record(payload: AnalyticsEvent): Promise<void>;
}
