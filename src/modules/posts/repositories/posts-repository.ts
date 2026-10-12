import "server-only";
import type { PostsDocument } from "../schemas/post";
import type { PostsRepository } from "./contracts";
import { storageProvider } from "@/modules/storage/services/config";
import { localPostsRepository } from "./local-posts-adapter";
import { SupabasePostsRepository } from "./supabase-posts";
const supabasePostsRepository = new SupabasePostsRepository();
export function getPostsRepository(): PostsRepository { return storageProvider() === "local" ? localPostsRepository : supabasePostsRepository; }
export const readPosts = () => getPostsRepository().read();
export const mutatePosts = (revision: number, update: (document: PostsDocument) => void) => getPostsRepository().mutate(revision, update);
export { PostsConflict } from "./errors";
