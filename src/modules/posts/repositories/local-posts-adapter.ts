import "server-only";
import type { PostsRepository } from "./contracts";
import * as local from "./local-posts";
export const localPostsRepository: PostsRepository = { read: local.readPosts, mutate: local.mutatePosts };
