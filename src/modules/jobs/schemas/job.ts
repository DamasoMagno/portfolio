import { z } from "zod";
import { discoveryStateSchema, emptyDiscovery, jobSourceSchema } from "./discovery";
const optionalText = (max = 1000) => z.string().trim().max(max).default("");
const lines = z.array(z.string().trim().min(1).max(500)).max(40).default([]);
export const jobStatus = z.enum(["saved", "applied", "interview", "offer", "closed"]);
export const jobInputSchema = z.object({
  company: z.string().trim().min(1, "Informe a empresa.").max(200),
  title: z.string().trim().min(1, "Informe o cargo.").max(200),
  url: optionalText(2000).refine(value => !value || /^https?:\/\//i.test(value) && (() => { try { return Boolean(new URL(value).hostname); } catch { return false; } })(), "Informe um link HTTP/HTTPS válido."),
  location: optionalText(300), workModel: z.enum(["unspecified", "remote", "hybrid", "onsite"]).default("unspecified"),
  level: optionalText(100), contract: optionalText(100), salary: optionalText(300), languages: optionalText(500),
  contact: optionalText(500), deadline: optionalText(10).refine(value => !value || /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value, "Informe uma data válida."),
  description: optionalText(16000), responsibilities: optionalText(8000), requirements: lines, desirable: lines,
  benefits: optionalText(4000), notes: optionalText(8000), resumeText: optionalText(30000),
  status: jobStatus.default("saved"),
}).strict().refine(job => Boolean(job.description || job.requirements.length), "Preencha a descrição ou os requisitos da vaga.");
export type JobInput = z.infer<typeof jobInputSchema>;
export const evidenceSchema = z.object({ sourceId: z.string(), source: z.string(), excerpt: z.string().max(500), terms: z.array(z.string()) });
export const requirementResultSchema = z.object({ requirement: z.string(), kind: z.enum(["required", "desirable", "description"]), terms: z.array(z.string()), matched: z.array(z.string()), missing: z.array(z.string()), status: z.enum(["found", "partial", "missing", "manual"]), evidence: z.array(evidenceSchema).max(6) });
export const aiAdviceSchema = z.object({
  summary: z.string().min(1).max(3000),
  strengths: z.array(z.object({ text: z.string().min(1).max(1000), sourceIds: z.array(z.string().max(100)).min(1).max(6) }).strict()).max(10),
  gaps: z.array(z.string().min(1).max(1000)).max(10),
  suggestions: z.array(z.string().min(1).max(1000)).max(10),
}).strict();
export const aiAssessmentSchema = aiAdviceSchema.extend({ model: z.string().max(200), createdAt: z.string().datetime(), sources: z.array(z.object({ id: z.string(), label: z.string(), text: z.string().max(12000) })), truncated: z.boolean() });
export const analysisSchema = z.object({
  id: z.string().uuid(), createdAt: z.string().datetime(), algorithmVersion: z.literal("ats-keywords-v1"),
  contentRevision: z.number().int().nonnegative(), postsRevision: z.number().int().nonnegative(), jobFingerprint: z.string(),
  score: z.number().int().min(0).max(100).nullable(), matchedKeywords: z.array(z.string()), missingKeywords: z.array(z.string()),
  requirements: z.array(requirementResultSchema).max(100), suggestions: z.array(z.string()).max(20),
  ai: aiAssessmentSchema.optional(),
  resumeMarkdown: z.string().max(100000), coverLetter: z.string().max(10000),
  sources: z.object({ profile: z.number(), experiences: z.number(), projects: z.number(), skills: z.number(), services: z.number(), recommendations: z.number(), posts: z.number(), resume: z.number() }),
});
export type JobAnalysis = z.infer<typeof analysisSchema>;
export const storedJobSchema = z.object({ id: z.string().uuid(), data: jobInputSchema, origin: z.object({ source: jobSourceSchema, externalId: z.string(), url: z.string().url() }).optional(), createdAt: z.string().datetime(), updatedAt: z.string().datetime(), analyses: z.array(analysisSchema).max(10) });
export type Job = z.infer<typeof storedJobSchema>;
export const jobsDocumentSchema = z.object({ version: z.literal(1), revision: z.number().int().nonnegative(), jobs: z.array(storedJobSchema).max(200), discovery: discoveryStateSchema.default(emptyDiscovery) });
export type JobsDocument = z.infer<typeof jobsDocumentSchema>;
export const jobActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("save"), revision: z.number().int().nonnegative(), id: z.string().uuid().optional(), data: jobInputSchema }).strict(),
  z.object({ action: z.literal("delete"), revision: z.number().int().nonnegative(), id: z.string().uuid() }).strict(),
  z.object({ action: z.literal("analyze-ai"), revision: z.number().int().nonnegative(), id: z.string().uuid() }).strict(),
  z.object({ action: z.literal("analyze"), revision: z.number().int().nonnegative(), id: z.string().uuid() }).strict(),
]);
export const emptyJobs = (): JobsDocument => ({ version: 1, revision: 0, jobs: [], discovery: emptyDiscovery() });
