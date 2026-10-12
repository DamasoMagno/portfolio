import "server-only";
import { mkdir, readFile, rename, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { postsDocumentSchema, type PostsDocument } from "../schemas/post";

import { PostsConflict } from "./errors";
export { PostsConflict } from "./errors";
const state = globalThis as typeof globalThis & { portfolioPostsQueue?: Promise<unknown> };
export const postsPath = () => path.resolve(process.env.PORTFOLIO_POSTS_FILE || path.join(process.cwd(), ".data", "posts.json"));
export async function readPosts(): Promise<PostsDocument> {
  try {
    const file = postsDocumentSchema.parse(JSON.parse(await readFile(postsPath(), "utf8")));
    return { ...file, posts: file.posts.map(({ data, ...identity }) => ({ ...data, ...identity })) };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { version: 1, revision: 0, enabled: false, posts: [] };
    throw error;
  }
}
export function mutatePosts(revision: number, update: (document: PostsDocument) => void) {
  const operation = (state.portfolioPostsQueue ?? Promise.resolve()).catch(() => undefined).then(async () => {
    const document = await readPosts();
    if (revision !== document.revision) throw new PostsConflict();
    update(document); document.revision++;
    const file = postsDocumentSchema.parse({ ...document, posts: document.posts.map(({ id, createdAt, updatedAt, ...data }) => ({ data, id, createdAt, updatedAt })) });
    const destination = postsPath();
    await mkdir(path.dirname(destination), { recursive: true, mode: 0o700 });
    const temporary = `${destination}.${randomUUID()}.tmp`;
    try { await writeFile(temporary, JSON.stringify(file, null, 2), { mode: 0o600 }); await rename(temporary, destination); }
    catch (error) { await unlink(temporary).catch(() => undefined); throw error; }
    return document;
  });
  state.portfolioPostsQueue = operation;
  return operation;
}
