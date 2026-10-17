import "server-only";
import { createHash } from "node:crypto";
import { convert } from "html-to-text";
import { z } from "zod";
import { opportunitySchema, type Opportunity } from "../schemas/discovery";
import type { JobFeedProvider } from "./contracts";

export const feedText = (value: string, max: number) => convert(value.slice(0, 100000), { wordwrap: false, limits: { maxInputLength: 100000, maxDepth: 30 }, selectors: [{ selector: "a", options: { ignoreHref: true } }, { selector: "img", format: "skip" }, { selector: "script", format: "skip" }, { selector: "style", format: "skip" }] }).trim().slice(0, max);
const optional = z.string().nullish().transform(value => value ?? "");
const remotiveRow = z.object({ id: z.number().int().positive(), url: z.string(), title: z.string(), company_name: z.string(), description: z.string(), candidate_required_location: optional, job_type: optional, salary: optional, publication_date: optional, tags: z.array(z.string()).optional().default([]) });
const arbeitnowRow = z.object({ slug: z.string(), url: z.string(), title: z.string(), company_name: z.string(), description: z.string(), location: optional, remote: z.boolean(), created_at: z.number(), tags: z.array(z.string()).optional().default([]), job_types: z.array(z.string()).optional().default([]) });
const date = (value: string | number) => { const parsed = new Date(value); return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString(); };

// Only fixed public endpoints are requested. Listing URLs are never fetched by this service.
export async function fetchFeed(url: string, extraHeaders: Record<string, string> = {}): Promise<unknown> {
  const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "PortfolioJobDiscovery/1.0", ...extraHeaders }, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(18000) });
  if (!response.ok || !response.body) throw new Error("Fonte indisponível");
  const maximum = 4 * 1024 * 1024;
  if (Number(response.headers.get("content-length")) > maximum) { await response.body.cancel(); throw new Error("Feed muito grande"); }
  const reader = response.body.getReader(), chunks: Uint8Array[] = []; let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      bytes += value.byteLength;
      if (bytes > maximum) { await reader.cancel(); throw new Error("Feed muito grande"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export class PublicJobFeedProvider implements JobFeedProvider {
  constructor(readonly source: "remotive" | "arbeitnow") {}
  async fetchJobs(now: Date): Promise<Opportunity[]> {
    const raw = await fetchFeed(this.source === "remotive" ? "https://remotive.com/api/remote-jobs?category=software-dev&limit=100" : "https://www.arbeitnow.com/api/job-board-api?page=1");
    const envelope = (this.source === "remotive" ? z.object({ jobs: z.array(z.unknown()).max(500) }) : z.object({ data: z.array(z.unknown()).max(500) })).parse(raw);
    const rows = "jobs" in envelope ? envelope.jobs : envelope.data;
    const opportunities: Opportunity[] = [];
    for (const row of rows.slice(0, 100)) {
      try {
        let listing;
        if (this.source === "remotive") {
          const item = remotiveRow.parse(row);
          listing = { externalId: String(item.id), url: item.url, title: item.title, company: item.company_name, location: item.candidate_required_location, remote: true, description: item.description, tags: item.tags, contract: item.job_type, salary: item.salary, publishedAt: date(item.publication_date ? `${item.publication_date}${/Z$|[+-]\d\d:\d\d$/.test(item.publication_date) ? "" : "Z"}` : "invalid") };
        } else {
          const item = arbeitnowRow.parse(row);
          listing = { externalId: item.slug, url: item.url, title: item.title, company: item.company_name, location: item.location, remote: item.remote, description: item.description, tags: item.tags, contract: item.job_types.join(" · "), salary: "", publishedAt: date(item.created_at * 1000) };
        }
        const id = `${this.source}:${createHash("sha256").update(listing.externalId).digest("hex").slice(0, 24)}`;
        const parsed = opportunitySchema.parse({ ...listing, id, source: this.source, workModel: listing.remote ? "remote" : "unknown", title: feedText(listing.title, 200), company: feedText(listing.company, 200), location: feedText(listing.location, 300), description: feedText(listing.description, 12000), tags: listing.tags.slice(0, 40).map(tag => feedText(tag, 100)).filter(Boolean), contract: feedText(listing.contract, 100), salary: feedText(listing.salary, 300), fetchedAt: now.toISOString() });
        const host = new URL(parsed.url).hostname.replace(/^www\./, "");
        if (host !== `${this.source === "remotive" ? "remotive" : "arbeitnow"}.com`) continue;
        opportunities.push(parsed);
      } catch { /* An invalid listing must not discard valid listings from the same feed. */ }
    }
    if (rows.length && !opportunities.length) throw new Error("Formato da fonte alterado");
    return opportunities;
  }
}
