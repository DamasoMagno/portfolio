import "server-only";
import { mkdir, readFile, rename, writeFile, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { z } from "zod";
import { eventSchema, type AnalyticsEvent, type StoredEvent } from "../schemas/event";

const retention = 90 * 24 * 60 * 60 * 1000;
// Validate persisted records separately: incoming payloads cannot set their timestamp.
const recordSchema = z.object({ payload: eventSchema, createdAt: z.string().datetime() });
const fileSchema = z.object({ version: z.literal(1), events: z.array(recordSchema).max(50000) });
const state = globalThis as typeof globalThis & { portfolioAnalyticsQueue?: Promise<unknown> };
export const analyticsPath = () => path.resolve(process.env.PORTFOLIO_ANALYTICS_FILE || path.join(process.cwd(), ".data", "analytics.json"));

export async function readEvents(now = Date.now()): Promise<StoredEvent[]> {
  try {
    const file = fileSchema.parse(JSON.parse(await readFile(analyticsPath(), "utf8")));
    return file.events.filter(event => Date.parse(event.createdAt) >= now - retention && Date.parse(event.createdAt) <= now).map(({ payload, createdAt }) => ({ ...payload, createdAt }));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}
export function recordEvent(payload: AnalyticsEvent) {
  const operation = (state.portfolioAnalyticsQueue ?? Promise.resolve()).catch(() => undefined).then(async () => {
    const parsed = eventSchema.parse(payload);
    const now = Date.now();
    const events = await readEvents(now);
    if (events.some(event => event.id === parsed.id)) return;
    const next = [...events, { ...parsed, createdAt: new Date(now).toISOString() }].slice(-50000);
    const file = { version: 1, events: next.map(({ createdAt, ...payload }) => ({ payload, createdAt })) };
    const destination = analyticsPath();
    await mkdir(path.dirname(destination), { recursive: true, mode: 0o700 });
    const temporary = `${destination}.${randomUUID()}.tmp`;
    try {
      await writeFile(temporary, JSON.stringify(file), { mode: 0o600 });
      await rename(temporary, destination);
    } catch (error) { await unlink(temporary).catch(() => undefined); throw error; }
  });
  state.portfolioAnalyticsQueue = operation;
  return operation;
}
