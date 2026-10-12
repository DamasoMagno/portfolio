import "server-only";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { collectionSchemas, profileSchema, type ContentResource } from "../schemas/content";
import { mutateContent, readContent } from "../repositories/content-repository";

const inputSchema = z.object({ action: z.enum(["save", "delete", "reorder"]), revision: z.number().int().nonnegative(), id: z.string().min(1).max(100).optional(), data: z.unknown().optional(), ids: z.array(z.string()).optional() });
export async function updateCollection(resource: ContentResource, body: unknown) {
  const input = inputSchema.parse(body);
  return mutateContent((content) => {
    const items = content[resource];
    if (input.action === "reorder") {
      const ids = input.ids ?? [];
      if (ids.length !== items.length || new Set(ids).size !== items.length || ids.some((id) => !items.some((item) => item.id === id))) throw new Error("Ordem inválida.");
      const byId = new Map(items.map((item) => [item.id, item]));
      (content[resource] as unknown[]) = ids.map((id) => byId.get(id)!);
      return;
    }
    const index = input.id ? items.findIndex((item) => item.id === input.id) : -1;
    if (input.id && index === -1) throw new Error("Registro não encontrado.");
    if (input.action === "delete") {
      if (!input.id) throw new Error("Informe o registro.");
      items.splice(index, 1); return;
    }
    const value = { ...collectionSchemas[resource].parse(input.data), id: input.id ?? randomUUID() };
    if (index >= 0) (items as unknown[])[index] = value;
    else (items as unknown[]).push(value);
  }, input.revision);
}
export async function updateProfile(body: unknown) {
  const { data, revision } = z.object({ data: profileSchema, revision: z.number().int().nonnegative() }).parse(body);
  return mutateContent((content) => { content.profile = data; }, revision);
}
export async function publicContent() {
  const content = await readContent();
  return { profile: content.profile, services: content.services.filter(item => item.published),
    projects: content.projects.filter((item) => item.published), skills: content.skills.filter((item) => item.published),
    experiences: content.experiences.filter((item) => item.published), recommendations: content.recommendations.filter((item) => item.published),
  };
}

export async function getBackofficeContent() { return readContent(); }
