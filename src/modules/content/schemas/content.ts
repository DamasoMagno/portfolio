import { projectTypeSchema } from "@/modules/messages/schemas/contact";
import { serviceSchema } from "@/modules/services/schemas/service";
import { z } from "zod";

const text = (max = 200) => z.string().trim().min(1, "Preencha os campos obrigatórios.").max(max);
const list = z.array(text()).max(50);
const webUrl = z.string().trim().max(2000).refine((value) => {
  if (!value) return true;
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
}, "Use uma URL http ou https válida.");
const mediaUrl = text(2000).refine((value) => {
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return true;
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
}, "Use um caminho local ou uma URL http/https válida.");
export const workType = z.enum(["freelance", "emprego", "projeto_pessoal", "estagio"]);
const publishing = { published: z.boolean().default(true) };

export const projectSchema = z.object({
  title: text(), description: text(8000), category: list.min(1, "Informe uma categoria."),
  cover: mediaUrl.or(z.literal("")).default(""), context: z.string().trim().max(8000).default(""), contribution: z.string().trim().max(8000).default(""), outcome: z.string().trim().max(8000).default(""),
  workType, tags: list, links: z.object({ github: webUrl, demo: webUrl }), ...publishing,
});
export const skillSchema = z.object({ title: text(), tags: list.min(1, "Informe uma habilidade."), ...publishing });
export const experienceSchema = z.object({ role: text(), company: text(), period: text(), description: text(8000), tasks: list, tags: list, workType, ...publishing });
export const recommendationSchema = z.object({ title: text(), description: text(8000), instructor: text(), href: webUrl.refine(Boolean, "Informe o link."), icon: z.enum(["code", "play", "book"]), ...publishing });
export const profileSchema = z.object({
  name: text(100), headline: text(), intro: text(2000), about: z.array(z.string().max(80000).refine(value => Boolean(value.trim()), "Preencha o Sobre mim.")).min(1).max(10).refine(paragraphs => paragraphs.join("\n\n").length <= 80000, "O Sobre mim deve ter no máximo 80 mil caracteres."),
  avatar: mediaUrl, resume: mediaUrl, email: z.string().trim().email().max(320),
  whatsapp: z.string().trim().regex(/^\d{10,15}$/, "Informe o WhatsApp com DDI, somente números."),
  github: webUrl, linkedin: webUrl,
});
const identity = { id: text(100) };
export const messageSchema = z.object({ name: text(), email: z.string().trim().email().max(320), message: text(8000), projectType: projectTypeSchema.default("outro") });
export const storedMessageSchema = messageSchema.extend({ ...identity, createdAt: text(), status: z.enum(["new", "read", "archived"]), delivery: z.enum(["backoffice", "local", "sent", "failed"]) });
export const contentSchema = z.object({
  version: z.literal(1), revision: z.number().int().nonnegative(), updatedAt: z.string().nullable(), profile: profileSchema,
  projects: z.array(projectSchema.extend(identity)).max(500),
  skills: z.array(skillSchema.extend(identity)).max(100),
  experiences: z.array(experienceSchema.extend(identity)).max(200),
  recommendations: z.array(recommendationSchema.extend(identity)).max(200),
  services: z.array(serviceSchema.extend(identity)).max(100),
  messages: z.array(storedMessageSchema).max(5000),
});
export type Profile = z.infer<typeof profileSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type SkillGroup = z.infer<typeof skillSchema>;
export type Recommendation = z.infer<typeof recommendationSchema>;
export type PortfolioContent = z.infer<typeof contentSchema>;
export type ContentResource = "projects" | "skills" | "experiences" | "recommendations" | "services";
export const collectionSchemas = { projects: projectSchema, skills: skillSchema, experiences: experienceSchema, recommendations: recommendationSchema, services: serviceSchema };
