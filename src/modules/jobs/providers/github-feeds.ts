import "server-only";
import { z } from "zod";
import { opportunitySchema, type Opportunity } from "../schemas/discovery";
import { githubListingMetadata } from "../services/listing-metadata";
import { feedText, fetchFeed } from "./public-feeds";
import type { JobFeedProvider } from "./contracts";
const repositories = { frontendbr: "frontendbr/vagas", backendbr: "backend-br/vagas" } as const;
const issueSchema = z.object({ number: z.number().int().positive(), title: z.string(), html_url: z.string().url(), body: z.string().nullable(), created_at: z.string().datetime(), state: z.literal("open"), labels: z.array(z.union([z.string(), z.object({ name: z.string() })])), pull_request: z.unknown().optional() });
export class GitHubJobFeedProvider implements JobFeedProvider {
  constructor(readonly source: keyof typeof repositories) {}
  async fetchJobs(now: Date): Promise<Opportunity[]> {
    const repo = repositories[this.source];
    const token = process.env.GITHUB_JOBS_TOKEN?.trim();
    const extraHeaders: Record<string, string> = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
    if (token) extraHeaders.Authorization = `Bearer ${token}`;
    const rows = z.array(z.unknown()).max(100).parse(await fetchFeed(`https://api.github.com/repos/${repo}/issues?state=open&sort=created&direction=desc&per_page=100`, extraHeaders));
    const jobs: Opportunity[] = [];
    for (const raw of rows) {
      const parsed = issueSchema.safeParse(raw);
      if (!parsed.success || parsed.data.pull_request) continue;
      const item = parsed.data, body = item.body ?? "", labels = item.labels.map(label => typeof label === "string" ? label : label.name);
      const url = new URL(item.html_url);
      if (url.hostname !== "github.com" || url.pathname !== `/${repo}/issues/${item.number}`) continue;
      const metadata = githubListingMetadata(item.title, body, labels);
      const listing = opportunitySchema.safeParse({ ...metadata, id: `${this.source}:${item.number}`, source: this.source, externalId: String(item.number), title: feedText(item.title, 200), company: feedText(metadata.company, 200), url: item.html_url, description: feedText(body, 12000), tags: labels.slice(0, 40).map(label => feedText(label, 100)).filter(Boolean), salary: "", publishedAt: item.created_at, fetchedAt: now.toISOString() });
      if (listing.success) jobs.push(listing.data);
    }
    if (rows.length && !jobs.length && rows.some(row => !(row && typeof row === "object" && "pull_request" in row))) throw new Error("Formato das vagas alterado");
    return jobs;
  }
}
