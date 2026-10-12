import type { AnalyticsEvent } from "../schemas/event";
let fallbackSession: string | undefined;
export function analyticsContext(): Omit<AnalyticsEvent, "id" | "type" | "label"> | null {
  if (typeof window === "undefined" || navigator.doNotTrack === "1" || typeof crypto.randomUUID !== "function" || !/^\/(?:blog(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)?)?$/.test(location.pathname)) return null;
  const now = Date.now();
  let session: string;
  try {
    const saved = JSON.parse(sessionStorage.getItem("portfolio_analytics_session") ?? "null");
    session = saved && typeof saved.id === "string" && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(saved.id) && Number.isFinite(saved.last) && saved.last <= now && now - saved.last < 30 * 60 * 1000 ? saved.id : crypto.randomUUID();
    sessionStorage.setItem("portfolio_analytics_session", JSON.stringify({ id: session, last: now }));
  } catch { session = fallbackSession ??= crypto.randomUUID(); }
  let source = "direto";
  try { const referrer = new URL(document.referrer); if (referrer.hostname !== location.hostname && /^[a-z0-9.-]+$/.test(referrer.hostname)) source = referrer.hostname; } catch { /* No referrer. */ }
  const device = /iPad|Tablet|Android(?!.*Mobile)/i.test(navigator.userAgent) ? "tablet" : /Mobi|iPhone|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";
  return { session, path: location.pathname, source, device };
}
export function trackEvent(type: "pageview" | "click", label?: AnalyticsEvent["label"]) {
  try {
    const context = analyticsContext(); if (!context) return;
    const payload = JSON.stringify({ ...context, id: crypto.randomUUID(), type, ...(label ? { label } : {}) });
    if (!navigator.sendBeacon?.("/api/analytics", new Blob([payload], { type: "application/json" }))) void fetch("/api/analytics", { method: "POST", body: payload, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => undefined);
  } catch { /* Optional analytics cannot interrupt the site. */ }
}
