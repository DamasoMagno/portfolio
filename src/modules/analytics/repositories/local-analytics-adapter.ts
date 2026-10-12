import "server-only";
import type { AnalyticsRepository } from "./contracts";
import * as local from "./local-analytics";
export const localAnalyticsRepository: AnalyticsRepository = { read: local.readEvents, record: local.recordEvent };
