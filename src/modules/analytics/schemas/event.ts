import { z } from "zod";

export const clickLabels = ["Currículo", "GitHub", "LinkedIn", "WhatsApp", "E-mail", "Código do projeto", "Demo do projeto", "Recomendação", "Seção: Início", "Seção: Sobre", "Seção: Habilidades", "Seção: Projetos", "Seção: Experiência", "Seção: Contato", "Seção: Serviços", "Seção: Posts", "Serviços: contato", "Post", "Mensagem recebida"] as const;
export const eventSchema = z.object({
  id: z.string().uuid(), session: z.string().uuid(),
  // Only public portfolio and blog paths; queries and hashes are never stored.
  path: z.string().max(150).regex(/^\/(?:blog(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)?)?$/), source: z.string().max(253).regex(/^(direto|[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?)$/),
  device: z.enum(["mobile", "tablet", "desktop"]),
  type: z.enum(["pageview", "click", "conversion"]), label: z.enum(clickLabels).optional(),
}).strict().refine(event => event.type === "conversion" ? event.label === "Mensagem recebida" : event.type === "click" ? Boolean(event.label) && event.label !== "Mensagem recebida" : event.label === undefined, "Evento inválido.");
export type AnalyticsEvent = z.infer<typeof eventSchema>;
export type StoredEvent = AnalyticsEvent & { createdAt: string };

export const analyticsContextSchema = z.object({ session: z.string().uuid(), path: z.string().max(150).regex(/^\/(?:blog(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)?)?$/), source: z.string().max(253).regex(/^(direto|[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?)$/), device: z.enum(["mobile", "tablet", "desktop"]) }).strict();
