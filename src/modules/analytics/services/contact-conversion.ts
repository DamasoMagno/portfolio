import "server-only";
import { randomUUID } from "node:crypto";
import { analyticsContextSchema } from "../schemas/event";
import { saveAnalyticsEvent } from "./analytics";
import { hasBackofficeAccess } from "@/modules/backoffice/services/access";
export async function recordContactConversion(request: Request, input: unknown, id: string = randomUUID()) {
  if (process.env.ANALYTICS_ENABLED === "false" || (await hasBackofficeAccess()) || request.headers.get("dnt") === "1" || /bot|crawler|spider|headless/i.test(request.headers.get("user-agent") ?? "")) return;
  const context = analyticsContextSchema.safeParse(input);
  if (!context.success) return;
  try { await saveAnalyticsEvent({ ...context.data, id, type: "conversion", label: "Mensagem recebida" }); }
  catch { console.error("[analytics] Não foi possível registrar a conversão de contato."); }
}
