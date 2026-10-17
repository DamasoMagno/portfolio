import "server-only";
import { randomUUID } from "node:crypto";
import { getBackofficeContent } from "@/modules/content/services/content";
import { getJobsRepository } from "../repositories/jobs-repository";
import { JobsConflict } from "../repositories/errors";
import { jobInputSchema, type JobsDocument } from "../schemas/job";
import { discoveryActionSchema, type JobSource } from "../schemas/discovery";
import { getJobFeedProviders } from "../providers/job-feed-providers";
import { alreadySaved, DISCOVERY_INTERVAL, DISCOVERY_LEASE, matchOpportunities, selectedSkills } from "./discovery-matching";

export class DiscoveryError extends Error {}
class DiscoveryNotDue extends Error {}
export async function getJobDiscovery() {
  const [data, content] = await Promise.all([getJobsRepository().read(), getBackofficeContent()]);
  return { data, skills: content.skills };
}

// Retry only the small discovery mutation against a fresh document. Saved jobs and
// edits made while a source request was in flight must always be preserved.
async function mutateLatest(update: (document: JobsDocument) => void) {
  const repository = getJobsRepository();
  for (let attempt = 0; attempt < 5; attempt++) {
    const current = await repository.read();
    try { return await repository.mutate(current.revision, update); }
    catch (error) { if (!(error instanceof JobsConflict) || attempt === 4) throw error; }
  }
  throw new JobsConflict();
}

export async function syncDiscoveredJobs(trigger: "manual" | "automatic", now = new Date()) {
  const [snapshot, content] = await Promise.all([getJobsRepository().read(), getBackofficeContent()]);
  if (trigger === "automatic" && !snapshot.discovery.settings.automatic) return { data: snapshot, message: "Busca automática desativada." };
  if (!selectedSkills(content.skills, snapshot.discovery.settings.skillGroupIds).length) return { data: snapshot, message: "Cadastre ou selecione suas habilidades antes de buscar vagas." };
  const runId = randomUUID(); let claimed = false; let due: JobSource[] = [];
  let claimedDocument: JobsDocument;
  try { claimedDocument = await mutateLatest(document => {
    claimed = false; due = [];
    const state = document.discovery;
    if (trigger === "automatic" && !state.settings.automatic) throw new DiscoveryNotDue();
    if (state.run && Date.parse(state.run.startedAt) + DISCOVERY_LEASE > now.getTime()) throw new DiscoveryNotDue();
    due = state.settings.sources.filter(source => !state.sourceStatus[source].lastAttemptAt || Date.parse(state.sourceStatus[source].lastAttemptAt!) + DISCOVERY_INTERVAL <= now.getTime());
    if (!due.length) throw new DiscoveryNotDue();
    claimed = true;
    state.run = { id: runId, startedAt: now.toISOString() };
    for (const source of due) state.sourceStatus[source].lastAttemptAt = now.toISOString();
  }); } catch (error) {
    if (!(error instanceof DiscoveryNotDue)) throw error;
    claimedDocument = await getJobsRepository().read();
  }
  if (!claimed) return { data: claimedDocument, message: "Usando as vagas já coletadas. As fontes são consultadas no máximo a cada 6 horas; uma busca pode já estar em andamento." };
  const providers = getJobFeedProviders().filter(provider => due.includes(provider.source));
  const results = await Promise.allSettled(providers.map(provider => provider.fetchJobs(now)));
  const data = await mutateLatest(document => {
    const state = document.discovery;
    if (state.run?.id !== runId) return;
    providers.forEach((provider, index) => {
      const result = results[index], status = state.sourceStatus[provider.source];
      if (result.status === "fulfilled") {
        state.opportunities = [...state.opportunities.filter(item => item.source !== provider.source), ...result.value.slice(0, 50)].slice(-200);
        status.lastSuccessAt = now.toISOString(); status.error = null; status.count = result.value.length;
      } else { status.error = "Não foi possível consultar esta fonte. As vagas anteriores foram preservadas."; }
    });
    state.run = null;
  });
  const failures = results.filter(result => result.status === "rejected").length;
  return { data, message: failures === results.length ? "As fontes estão indisponíveis. As vagas anteriores foram preservadas." : failures ? "Busca concluída parcialmente. Confira o estado de cada fonte." : "Busca concluída. As vagas foram comparadas com suas habilidades." };
}

export async function updateDiscovery(input: unknown) {
  const action = discoveryActionSchema.parse(input);
  if (action.action === "sync" || action.action === "automatic-sync") return syncDiscoveredJobs(action.action === "sync" ? "manual" : "automatic");
  const repository = getJobsRepository();
  const content = await getBackofficeContent();
  let importedId: string | undefined;
  const data = await repository.mutate(action.revision, document => {
    const state = document.discovery;
    if (action.action === "settings") {
      if (action.data.skillGroupIds.some(id => !content.skills.some(group => group.id === id))) throw new DiscoveryError("Um grupo de habilidades foi removido. Atualize a página.");
      state.settings = action.data; return;
    }
    const listing = state.opportunities.find(item => item.id === action.id);
    if (!listing) throw new DiscoveryError("Esta vaga não está mais no resultado. Atualize a busca.");
    if (action.action === "dismiss") {
      state.dismissedIds = Array.from(new Set([...state.dismissedIds, listing.id])).slice(-1000); return;
    }
    if (alreadySaved(listing, document.jobs)) throw new DiscoveryError("Esta vaga já está nas suas candidaturas.");
    if (!matchOpportunities(state, content.skills, document.jobs).some(item => item.id === listing.id)) throw new DiscoveryError("Esta vaga não corresponde aos filtros atuais ou ficou desatualizada.");
    if (document.jobs.length >= 200) throw new DiscoveryError("Você atingiu o limite de 200 candidaturas. Remova registros antigos antes de importar.");
    const now = new Date().toISOString(); importedId = randomUUID();
    document.jobs.unshift({ id: importedId, createdAt: now, updatedAt: now, analyses: [], origin: { source: listing.source, externalId: listing.externalId, url: listing.url }, data: jobInputSchema.parse({ company: listing.company, title: listing.title, description: listing.description, url: listing.url, location: listing.location, workModel: listing.workModel === "unknown" ? "unspecified" : listing.workModel, contract: listing.contract, salary: listing.salary }) });
  });
  return { data, importedId, message: action.action === "settings" ? "Preferências salvas. A lista já usa os novos filtros." : action.action === "dismiss" ? "Vaga ocultada das sugestões." : "Vaga adicionada às candidaturas. Você já pode analisar seu currículo." };
}
