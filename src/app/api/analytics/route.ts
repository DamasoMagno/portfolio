import { NextResponse } from "next/server";
import { eventSchema } from "@/modules/analytics/schemas/event";
import { saveAnalyticsEvent } from "@/modules/analytics/services/analytics";
import { hasBackofficeAccess, sameOrigin } from "@/modules/backoffice/services/access";

const state = globalThis as typeof globalThis & { portfolioAnalyticsLimits?: Map<string, { start: number; count: number }> };
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem não autorizada." }, { status: 403 });
  if (process.env.ANALYTICS_ENABLED === "false" || request.headers.get("dnt") === "1" || (await hasBackofficeAccess()) || /bot|crawler|spider|headless/i.test(request.headers.get("user-agent") ?? "")) return new NextResponse(null, { status: 204 });
  if (Number(request.headers.get("content-length") ?? 0) > 2048) return new NextResponse(null, { status: 413 });
  try {
    const raw = await request.text();
    if (raw.length > 2048) return new NextResponse(null, { status: 413 });
    const parsed = eventSchema.safeParse(JSON.parse(raw));
    if (!parsed.success || parsed.data.type === "conversion") return NextResponse.json({ error: "Evento inválido." }, { status: 400 });
    const now = Date.now();
    const limits = state.portfolioAnalyticsLimits ??= new Map();
    for (const [id, value] of Array.from(limits)) if (now - value.start >= 60000) limits.delete(id);
    const limit = limits.get(parsed.data.session) ?? { start: now, count: 0 };
    if (limit.count >= 60 || (!limits.has(parsed.data.session) && limits.size >= 10000)) return new NextResponse(null, { status: 429 });
    limit.count++; limits.set(parsed.data.session, limit);
    await saveAnalyticsEvent(parsed.data);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Evento inválido." }, { status: 400 });
    console.error("Não foi possível registrar analytics.");
    return NextResponse.json({ error: "Analytics indisponível." }, { status: 503 });
  }
}
