import "server-only";
import type { ContentRepository } from "./contracts";
import * as local from "./local-content";
export const localContentRepository: ContentRepository = { read: local.readContent, mutate: local.mutateContent };
