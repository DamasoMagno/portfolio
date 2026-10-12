import { z } from "zod";
export const postInputSchema = z.object({
  title: z.string().trim().min(1, "Informe o título.").max(200),
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use letras minúsculas, números e hífens no endereço."),
  excerpt: z.string().trim().max(500), body: z.string().trim().max(80000),
  cover: z.string().trim().max(2000).refine(value => {
    if (!value) return true;
    if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return true;
    try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
  }, "Use uma URL HTTP/HTTPS ou caminho local para a imagem."),
  tags: z.array(z.string().trim().min(1).max(60)).max(20),
  published: z.boolean(), publishedAt: z.string().datetime().nullable(),
}).refine(post => !post.published || Boolean(post.body && post.excerpt), "Preencha o resumo e o conteúdo antes de publicar.");
export const storedPostSchema = z.object({ data: postInputSchema, id: z.string().uuid(), createdAt: z.string().datetime(), updatedAt: z.string().datetime() });
export const postsDocumentSchema = z.object({ version: z.literal(1), revision: z.number().int().nonnegative(), enabled: z.boolean(), posts: z.array(storedPostSchema).max(1000) });
export type PostInput = z.infer<typeof postInputSchema>;
export type Post = PostInput & { id: string; createdAt: string; updatedAt: string };
export type PostsDocument = { version: 1; revision: number; enabled: boolean; posts: Post[] };
export const postActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("save"), revision: z.number().int().nonnegative(), id: z.string().uuid().optional(), data: postInputSchema }).strict(),
  z.object({ action: z.literal("delete"), revision: z.number().int().nonnegative(), id: z.string().uuid() }).strict(),
  z.object({ action: z.literal("settings"), revision: z.number().int().nonnegative(), enabled: z.boolean() }).strict(),
]);
export function postSlug(title: string) { return title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120).replace(/-$/g, ""); }
export function readingMinutes(body: string) { return Math.max(1, Math.ceil(body.split(/\s+/).filter(Boolean).length / 200)); }
