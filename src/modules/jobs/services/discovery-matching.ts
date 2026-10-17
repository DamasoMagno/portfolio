import type { DiscoverySkillGroup as SkillGroup } from "../schemas/discovery";
import type { Job } from "../schemas/job";
import type { DiscoveryState, Opportunity } from "../schemas/discovery";
import { contractTypes, declaredWorkModel, type ContractType } from "./listing-metadata";
import { canonicalSkill, normalize, technologyKeywords, termMatches } from "./keywords";

export type MatchedOpportunity = Opportunity & { score: number; matchedSkills: string[]; missingSkills: string[]; contractTypes: ContractType[] };
export const DISCOVERY_INTERVAL = 6 * 60 * 60 * 1000;
export const DISCOVERY_LEASE = 2 * 60 * 1000;
export function selectedSkills(groups: SkillGroup[], selected: string[]) {
  return Array.from(new Set(groups.filter(group => !selected.length || selected.includes(group.id)).flatMap(group => group.tags).map(canonicalSkill).filter(Boolean))).slice(0, 500);
}
export function listingIdentity(value: Pick<Opportunity, "title" | "company" | "location">) {
  const company = normalize(value.company);
  let title = normalize(value.title).replace(/^\[[^\]]*\]\s*/, "");
  if (company && title.endsWith(company)) title = title.slice(0, -company.length).replace(/\s*(?:na|no|at|@|[-–—])\s*$/, "").trim();
  return [company, title, normalize(value.location)].join("|");
}
const normalizedUrl = (url: string) => { try { const parsed = new URL(url); return `${parsed.hostname.replace(/^www\./, "")}${parsed.pathname.replace(/\/$/, "")}`; } catch { return url; } };
export function alreadySaved(listing: Opportunity, jobs: Job[]) {
  return jobs.some(job => job.origin?.source === listing.source && job.origin.externalId === listing.externalId || normalizedUrl(job.data.url) === normalizedUrl(listing.url) || listingIdentity(job.data) === listingIdentity(listing));
}
export function nextDiscoveryAt(state: DiscoveryState): number {
  return Math.min(...state.settings.sources.map(source => state.sourceStatus[source].lastAttemptAt ? Date.parse(state.sourceStatus[source].lastAttemptAt!) + DISCOVERY_INTERVAL : 0));
}
export function matchOpportunities(state: DiscoveryState, groups: SkillGroup[], jobs: Job[], now = Date.now()): MatchedOpportunity[] {
  const skills = selectedSkills(groups, state.settings.skillGroupIds);
  if (!skills.length) return [];
  const dismissed = new Set(state.dismissedIds), unique = new Set<string>();
  return state.opportunities.flatMap(listing => {
    if (!state.settings.sources.includes(listing.source) || dismissed.has(listing.id) || alreadySaved(listing, jobs)) return [];
    const declared = listing.workModel !== "unknown" ? listing.workModel : listing.remote ? "remote" : declaredWorkModel(`${listing.title} ${listing.location}`);
    const isRemote = declared === "remote";
    const localFortaleza = /\bfortaleza\b/.test(normalize(listing.location));
    if (!isRemote && (state.settings.remoteOnly || !localFortaleza || !["hybrid", "onsite"].includes(declared))) return [];
    const contracts = contractTypes(listing.contract || `${listing.title}\n${listing.description}`);
    if (!contracts.length && /\b(estagio|internship|voluntario|volunteer|aprendiz|apprenticeship)\b/.test(normalize(`${listing.contract} ${listing.title}`))) return [];
    if (contracts.length ? !contracts.some(type => state.settings.contracts.includes(type)) : !state.settings.includeUnknownContract) return [];
    if (Date.parse(listing.fetchedAt) < now - 7 * 86400000 || listing.publishedAt && (Date.parse(listing.publishedAt) < now - state.settings.maxAgeDays * 86400000 || Date.parse(listing.publishedAt) > now + 86400000)) return [];
    const text = `${listing.title}\n${listing.tags.join(" ")}\n${listing.description}`;
    const matchedSkills = skills.filter(skill => termMatches(skill === "React" ? text.replace(/react[ -]native/gi, "") : text, skill));
    if (!matchedSkills.length) return [];
    const technologies = Array.from(new Set([...technologyKeywords(text), ...matchedSkills]));
    const missingSkills = technologies.filter(term => !skills.some(skill => normalize(skill) === normalize(term)));
    const score = Math.round(100 * matchedSkills.length / Math.max(1, matchedSkills.length + missingSkills.length));
    if (score < state.settings.minScore) return [];
    return [{ ...listing, remote: isRemote, workModel: declared, score, matchedSkills, missingSkills, contractTypes: contracts }];
  }).sort((a, b) => Number(b.remote) - Number(a.remote) || b.score - a.score || b.matchedSkills.length - a.matchedSkills.length || (b.publishedAt ?? b.fetchedAt).localeCompare(a.publishedAt ?? a.fetchedAt)).filter(listing => {
    const identity = listingIdentity(listing), url = normalizedUrl(listing.url);
    if (unique.has(identity) || unique.has(url)) return false;
    unique.add(identity); unique.add(url); return true;
  });
}
