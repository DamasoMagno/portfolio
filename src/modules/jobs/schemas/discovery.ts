import { z } from "zod";

export const jobSourceSchema = z.enum(["remotive", "arbeitnow", "frontendbr", "backendbr"]);
export type DiscoverySkillGroup = import("@/modules/content/schemas/content").PortfolioContent["skills"][number];
export type JobSource = z.infer<typeof jobSourceSchema>;
export const sourceLabels: Record<JobSource, string> = { remotive: "Remotive", arbeitnow: "Arbeitnow", frontendbr: "Front-End Brasil", backendbr: "Back-End Brasil" };
export const discoverySettingsSchema = z.object({
  automatic: z.boolean().default(true),
  sources: z.array(jobSourceSchema).min(1).max(4).refine(values => new Set(values).size === values.length).default(["frontendbr", "backendbr"]),
  skillGroupIds: z.array(z.string().min(1).max(100)).max(100).default([]),
  remoteOnly: z.boolean().default(false),
  contracts: z.array(z.enum(["PJ", "CLT"])).min(1).max(2).refine(values => new Set(values).size === values.length).default(["PJ", "CLT"]),
  includeUnknownContract: z.boolean().default(true),
  minScore: z.number().int().min(1).max(100).default(25),
  maxAgeDays: z.number().int().min(1).max(90).default(30),
}).strict();
export type DiscoverySettings = z.infer<typeof discoverySettingsSchema>;
export const opportunitySchema = z.object({
  id: z.string().min(1).max(100), source: jobSourceSchema, externalId: z.string().min(1).max(200),
  title: z.string().min(1).max(200), company: z.string().min(1).max(200),
  url: z.string().url().max(2000).refine(value => { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password && ["remotive.com", "www.remotive.com", "www.arbeitnow.com", "arbeitnow.com", "github.com"].includes(url.hostname); }),
  location: z.string().max(300), remote: z.boolean(), workModel: z.enum(["remote", "hybrid", "onsite", "unknown"]).default("unknown"), description: z.string().min(1).max(12000),
  tags: z.array(z.string().min(1).max(100)).max(40), contract: z.string().max(100), salary: z.string().max(300),
  publishedAt: z.string().datetime().nullable(), fetchedAt: z.string().datetime(),
});
export type Opportunity = z.infer<typeof opportunitySchema>;
export const sourceStatusSchema = z.object({ lastAttemptAt: z.string().datetime().nullable(), lastSuccessAt: z.string().datetime().nullable(), error: z.string().max(300).nullable(), count: z.number().int().nonnegative() });
export const discoveryStateSchema = z.object({
  settings: discoverySettingsSchema.default({}),
  opportunities: z.array(opportunitySchema).max(200).default([]),
  dismissedIds: z.array(z.string().max(100)).max(1000).default([]),
  sourceStatus: z.object({
    remotive: sourceStatusSchema.default({ lastAttemptAt: null, lastSuccessAt: null, error: null, count: 0 }),
    arbeitnow: sourceStatusSchema.default({ lastAttemptAt: null, lastSuccessAt: null, error: null, count: 0 }),
    frontendbr: sourceStatusSchema.default({ lastAttemptAt: null, lastSuccessAt: null, error: null, count: 0 }),
    backendbr: sourceStatusSchema.default({ lastAttemptAt: null, lastSuccessAt: null, error: null, count: 0 }),
  }).default({}),
  run: z.object({ id: z.string().uuid(), startedAt: z.string().datetime() }).nullable().default(null),
});
export type DiscoveryState = z.infer<typeof discoveryStateSchema>;
export const emptyDiscovery = (): DiscoveryState => discoveryStateSchema.parse({});
export const discoveryActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("sync") }).strict(),
  z.object({ action: z.literal("automatic-sync") }).strict(),
  z.object({ action: z.literal("settings"), revision: z.number().int().nonnegative(), data: discoverySettingsSchema }).strict(),
  z.object({ action: z.literal("import"), revision: z.number().int().nonnegative(), id: z.string().min(1).max(100) }).strict(),
  z.object({ action: z.literal("dismiss"), revision: z.number().int().nonnegative(), id: z.string().min(1).max(100) }).strict(),
]);
