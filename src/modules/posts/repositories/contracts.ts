import type { PostsDocument } from "../schemas/post";
export interface PostsRepository {
  read(): Promise<PostsDocument>;
  mutate(revision: number, update: (document: PostsDocument) => void): Promise<PostsDocument>;
}
