import { type StoredEvent } from "../schemas/event";

const dayLength = 24 * 60 * 60 * 1000;
const dayKey = (time: number) => new Date(time).toISOString().slice(0, 10);
export function analyticsReport(events: StoredEvent[], days: number, now = Date.now()) {
  const today = Date.parse(`${dayKey(now)}T00:00:00Z`);
  const start = today - (days - 1) * dayLength;
  const current = events.filter(event => Date.parse(event.createdAt) >= start && Date.parse(event.createdAt) <= now);
  const views = current.filter(event => event.type === "pageview");
  const sessions = new Map<string, StoredEvent>();
  // Use each session's first page view for attribution, even if it started before the period.
  const firstViews = new Map<string, StoredEvent>();
  for (const event of [...events].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) if (event.type === "pageview" && !firstViews.has(event.session)) firstViews.set(event.session, event);
  for (const event of views) sessions.set(event.session, firstViews.get(event.session) ?? event);
  function rank(values: string[]) {
    const counts = new Map<string, number>();
    values.forEach(value => counts.set(value, (counts.get(value) ?? 0) + 1));
    return Array.from(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }
  const clicks = current.filter(event => event.type === "click");
  const conversions = current.filter(event => event.type === "conversion" && event.label === "Mensagem recebida");
  const convertedSessions = new Set(conversions.filter(event => sessions.has(event.session)).map(event => event.session));
  const whatsapp = clicks.filter(event => event.label === "WhatsApp").length;
  const resume = clicks.filter(event => event.label === "Currículo").length;
  return {
    conversions: { messages: conversions.length, whatsapp, resume, convertedSessions: convertedSessions.size, rate: sessions.size ? Math.round(convertedSessions.size / sessions.size * 10000) / 100 : 0 },
    days, views: views.length, sessions: sessions.size, clicks: clicks.length,
    daily: Array.from({ length: days }, (_, index) => {
      const date = dayKey(start + index * dayLength);
      return { date, views: views.filter(event => event.createdAt.startsWith(date)).length };
    }),
    sources: rank(Array.from(sessions.values()).map(event => event.source === "direto" ? "Direto / desconhecido" : event.source)),
    devices: rank(Array.from(sessions.values()).map(event => ({ mobile: "Celular", tablet: "Tablet", desktop: "Computador" })[event.device])),
    pages: rank(views.map(event => event.path)), actions: rank(clicks.map(event => event.label!)),
    updatedAt: new Date(now).toISOString(),
  };
}
export type AnalyticsReport = ReturnType<typeof analyticsReport>;
