import "server-only";
import { mkdir, readFile, rename, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { contentSchema, type PortfolioContent } from "../schemas/content";
import { initialContent } from "./seed";

import { RevisionConflict } from "./errors";
export { RevisionConflict } from "./errors";
const processState = globalThis as typeof globalThis & { portfolioWriteQueue?: Promise<unknown> };
export const contentPath = () => path.resolve(process.env.PORTFOLIO_DATA_FILE || path.join(process.cwd(), ".data", "portfolio.json"));

export async function readContent(): Promise<PortfolioContent> {
  try {
    const raw = JSON.parse(await readFile(contentPath(), "utf8"));
    // Add the new collection to older documents without replacing existing edits.
    if (raw && typeof raw === "object" && raw.services === undefined) raw.services = initialContent().services;
    return contentSchema.parse(raw);
  }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return initialContent();
    throw error; // A corrupted file must never silently overwrite saved content.
  }
}

export async function mutateContent(update: (content: PortfolioContent) => void, revision?: number) {
  const operation = (processState.portfolioWriteQueue ?? Promise.resolve()).catch(() => undefined).then(async () => {
    const content = await readContent();
    if (revision !== undefined && content.revision !== revision) throw new RevisionConflict();
    update(content);
    content.revision += 1;
    content.updatedAt = new Date().toISOString();
    const validated = contentSchema.parse(content);
    const destination = contentPath();
    await mkdir(path.dirname(destination), { recursive: true, mode: 0o700 });
    const temporary = `${destination}.${randomUUID()}.tmp`;
    try {
      await writeFile(temporary, JSON.stringify(validated, null, 2), { mode: 0o600 });
      await rename(temporary, destination);
    } catch (error) { await unlink(temporary).catch(() => undefined); throw error; }
    return validated;
  });
  processState.portfolioWriteQueue = operation;
  return operation;
}
