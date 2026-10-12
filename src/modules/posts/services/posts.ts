import "server-only";
import { randomUUID } from "node:crypto";
import { postActionSchema, type PostsDocument } from "../schemas/post";
import { mutatePosts, readPosts } from "../repositories/posts-repository";

export function visiblePosts(document: PostsDocument, now = Date.now()) {
  if (!document.enabled) return [];
  return document.posts.filter(post => post.published && post.publishedAt && Date.parse(post.publishedAt) <= now)
    .sort((a, b) => b.publishedAt!.localeCompare(a.publishedAt!) || a.id.localeCompare(b.id));
}
export async function publicPosts() {
  const document = await readPosts();
  return { enabled: document.enabled, posts: visiblePosts(document) };
}
export async function updatePosts(input: unknown) {
  const action = postActionSchema.parse(input);
  return mutatePosts(action.revision, document => {
    if (action.action === "settings") { document.enabled = action.enabled; return; }
    if (action.action === "delete") {
      const index = document.posts.findIndex(post => post.id === action.id);
      if (index < 0) throw new Error("Post não encontrado.");
      document.posts.splice(index, 1); return;
    }
    const existing = action.id ? document.posts.find(post => post.id === action.id) : undefined;
    if (action.id && !existing) throw new Error("Post não encontrado.");
    if (document.posts.some(post => post.slug === action.data.slug && post.id !== action.id)) throw new Error("Esse endereço já está em uso por outro post.");
    const now = new Date().toISOString();
    const saved = { ...action.data, id: existing?.id ?? randomUUID(), createdAt: existing?.createdAt ?? now, updatedAt: now,
      publishedAt: action.data.published ? action.data.publishedAt ?? now : action.data.publishedAt };
    if (existing) document.posts[document.posts.indexOf(existing)] = saved;
    else document.posts.push(saved);
  });
}

export async function getBackofficePosts() { return readPosts(); }
