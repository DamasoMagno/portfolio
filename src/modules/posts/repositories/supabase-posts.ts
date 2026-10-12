import type { PostsRepository } from "./contracts";
import "server-only";
import { readDocument, saveDocument } from "@/modules/storage/repositories/documents";
import { postsDocumentSchema, type PostsDocument } from "../schemas/post";
import { PostsConflict } from "./errors";

export class SupabasePostsRepository implements PostsRepository {
  async read(): Promise<PostsDocument> {
    const raw = await readDocument("posts");
    if (raw === null) return { version: 1, revision: 0, enabled: false, posts: [] };
    const file = postsDocumentSchema.parse(raw);
    return { ...file, posts: file.posts.map(({ data, ...identity }) => ({ ...data, ...identity })) };
  }
  async mutate(revision: number, update: (document: PostsDocument) => void): Promise<PostsDocument> {
    const document = await this.read();
    if (document.revision !== revision) throw new PostsConflict();
    update(document); document.revision++;
    const file = postsDocumentSchema.parse({ ...document, posts: document.posts.map(({ id, createdAt, updatedAt, ...data }) => ({ data, id, createdAt, updatedAt })) });
    if (!await saveDocument("posts", revision, file)) throw new PostsConflict();
    return document;
  }
}
