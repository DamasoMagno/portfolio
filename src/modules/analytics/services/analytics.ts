import "server-only";
import { eventSchema, type AnalyticsEvent } from "../schemas/event";
import { readEvents, recordEvent } from "../repositories/analytics-repository";
import { analyticsReport } from "./report";

export async function getAnalyticsReport(requestedDays: number) {
  const days = [7, 30, 90].includes(requestedDays) ? requestedDays : 30;
  return analyticsReport(await readEvents(), days);
}
export async function saveAnalyticsEvent(event: AnalyticsEvent) {
  await recordEvent(eventSchema.parse(event));
}
