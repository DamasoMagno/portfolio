import type { ContentRepository } from "./contracts";
import "server-only";
import { readDocument, saveDocument } from "@/modules/storage/repositories/documents";
import { contentSchema, type PortfolioContent } from "../schemas/content";
import { initialContent } from "./seed";
import { RevisionConflict } from "./errors";

export class SupabaseContentRepository implements ContentRepository {
  async read(): Promise<PortfolioContent> {
    const raw = await readDocument("content");
    if (raw === null) return initialContent();
    if (typeof raw === "object" && !("services" in raw)) return contentSchema.parse({ ...raw, services: initialContent().services });
    return contentSchema.parse(raw);
  }

  async mutate(update: (content: PortfolioContent) => void, revision?: number): Promise<PortfolioContent> {
    // CAS happens in PostgreSQL, so concurrent server instances cannot overwrite each other.
    for (let attempt = 0; attempt < 8; attempt++) {
      const content = await this.read();
      if (revision !== undefined && revision !== content.revision) throw new RevisionConflict();
      const expected = content.revision;
      update(content); content.revision++; content.updatedAt = new Date().toISOString();
      const validated = contentSchema.parse(content);
      if (await saveDocument("content", expected, validated)) return validated;
      if (revision !== undefined) throw new RevisionConflict();
    }
    throw new RevisionConflict();
  }
}
