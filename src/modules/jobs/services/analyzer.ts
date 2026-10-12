import { createHash, randomUUID } from "node:crypto";
import type { PortfolioContent } from "@/modules/content/schemas/content";
import type { PostsDocument } from "@/modules/posts/schemas/post";
import { analysisSchema, type JobAnalysis, type JobInput } from "../schemas/job";
import { candidateSources, type CandidateSource } from "./candidate";
import { extractKeywords, normalize, termMatches } from "./keywords";

export const jobFingerprint = (job: JobInput) => createHash("sha256").update(JSON.stringify(job)).digest("hex");
const plain = (text: string) => text.replace(/<[^>]*>/g, "").replace(/[\[\]#*_`]/g, "");
function excerpt(source: CandidateSource, terms: string[]) {
  const line = source.text.split(/\n|(?<=[.!?])\s/).find(value => terms.some(term => termMatches(value, term))) ?? source.text;
  return plain(line).trim().slice(0, 500);
}
// Materials/posts/services are considered, but are not proof of professional experience.
const strongSource = (source: CandidateSource) => !/^(recommendation|post|service):/.test(source.id);
function draftResume(content: PortfolioContent, job: JobInput, keywords: string[]) {
  const rank = (text: string) => keywords.filter(term => termMatches(text, term)).length;
  const experiences = [...content.experiences].sort((a, b) => rank(JSON.stringify(b)) - rank(JSON.stringify(a))).slice(0, 8);
  const projects = [...content.projects].sort((a, b) => rank(JSON.stringify(b)) - rank(JSON.stringify(a))).slice(0, 6);
  const skills = [...new Set(content.skills.flatMap(item => item.tags))].sort((a, b) => rank(b) - rank(a));
  const p = content.profile;
  const sections = [`# ${p.name}`, `${p.headline}\n\n${p.email}${p.linkedin ? ` · ${p.linkedin}` : ""}${p.github ? ` · ${p.github}` : ""}`, `## Objetivo\n${job.title} · ${job.company}`, `## Resumo profissional\n${plain(p.intro)}`, `## Habilidades\n${skills.join(" · ")}`];
  if (experiences.length) sections.push(`## Experiência profissional\n${experiences.map(item => `### ${item.role} · ${item.company}\n${item.period}\n\n${plain(item.description)}${item.tasks.length ? `\n\n${item.tasks.map(task => `- ${plain(task)}`).join("\n")}` : ""}`).join("\n\n")}`);
  if (projects.length) sections.push(`## Projetos\n${projects.map(item => `### ${item.title}\n${plain(item.description)}${item.contribution ? `\n\nParticipação: ${plain(item.contribution)}` : ""}${item.outcome ? `\n\nResultados: ${plain(item.outcome)}` : ""}\n\n${item.tags.join(" · ")}${item.links.demo || item.links.github ? `\n${item.links.demo || item.links.github}` : ""}`).join("\n\n")}`);
  return sections.join("\n\n").slice(0, 100000);
}
export function analyzeJob(job: JobInput, content: PortfolioContent, posts: PostsDocument): JobAnalysis {
  const { sources, counts } = candidateSources(content, posts, job);
  const requirements: { requirement: string; kind: "required" | "desirable" | "description" }[] = [
    ...job.requirements.map(requirement => ({ requirement, kind: "required" as const })),
    ...job.desirable.map(requirement => ({ requirement, kind: "desirable" as const })),
    ...(job.languages ? [{ requirement: job.languages, kind: "required" as const }] : []),
  ];
  // With no explicit requirements, compare the pasted job description and responsibilities.
  if (!requirements.length) requirements.push(...[job.description, job.responsibilities].join("\n").split(/\n|;/).map(value => value.trim()).filter(Boolean).slice(0, 40).map(requirement => ({ requirement: requirement.slice(0, 500), kind: "description" as const })));
  const results = requirements.map(({ requirement, kind }) => {
    const terms = extractKeywords(requirement);
    const evidence = sources.map(source => {
      const matched = terms.filter(term => termMatches(source.text, term));
      return matched.length ? { sourceId: source.id, source: source.label, excerpt: excerpt(source, matched), terms: matched } : null;
    }).filter((item): item is NonNullable<typeof item> => item !== null).sort((a, b) => b.terms.length - a.terms.length).slice(0, 6);
    const matched = terms.filter(term => sources.some(source => strongSource(source) && termMatches(source.text, term)));
    const missing = terms.filter(term => !matched.includes(term));
    const manual = /\b(?:ou|or)\b|\d+\s*(?:anos?|years?)|fluente|fluency|avancado|advanced|graduacao|diploma|bacharel/i.test(normalize(requirement));
    const status = !terms.length ? "manual" as const : !matched.length ? "missing" as const : missing.length || manual ? "partial" as const : "found" as const;
    return { requirement, kind, terms, matched, missing, status, evidence };
  });
  const allTerms = [...new Set(results.flatMap(item => item.terms))];
  const matchedKeywords = allTerms.filter(term => sources.some(source => strongSource(source) && termMatches(source.text, term)));
  const missingKeywords = allTerms.filter(term => !matchedKeywords.includes(term));
  // Each unique keyword is counted once; mandatory requirements have weight 2.
  const weights = new Map<string, number>();
  for (const item of results) for (const term of item.terms) weights.set(term, Math.max(weights.get(term) ?? 0, item.kind === "required" ? 2 : 1));
  const total = [...weights.values()].reduce((a, b) => a + b, 0);
  const earned = matchedKeywords.reduce((sum, term) => sum + (weights.get(term) ?? 0), 0);
  const suggestions = [
    ...(missingKeywords.length ? [`Verifique os termos sem evidência: ${missingKeywords.slice(0, 15).join(", ")}. Inclua somente o que você realmente utiliza e consegue demonstrar.`] : []),
    ...(results.some(item => item.status === "partial" || item.status === "manual") ? ["Revise manualmente exigências de tempo de experiência, idioma, formação e requisitos com alternativas. A presença de termos não comprova domínio ou duração."] : []),
    "Use títulos de seção comuns, datas consistentes e texto selecionável ao exportar o currículo. Evite colocar informações essenciais somente em imagens.",
    "Confira o rascunho antes de enviar: ele organiza dados existentes e pode incluir experiências ou projetos ainda não publicados no portfólio.",
    ...(job.resumeText ? ["O texto de currículo informado participa da comparação. O rascunho é montado com os campos estruturados do admin; mantenha manualmente formação, idiomas e outros dados presentes somente no currículo original."] : ["Cole o texto do seu currículo para incluir informações que não estejam nos campos do admin. O PDF do perfil não é lido automaticamente."]),
  ];
  return analysisSchema.parse({ id: randomUUID(), createdAt: new Date().toISOString(), algorithmVersion: "ats-keywords-v1", contentRevision: content.revision, postsRevision: posts.revision, jobFingerprint: jobFingerprint(job), score: total ? Math.round(earned / total * 100) : null,
    matchedKeywords, missingKeywords, requirements: results, suggestions, resumeMarkdown: draftResume(content, job, matchedKeywords),
    coverLetter: `Olá, equipe da ${job.company}.\n\nGostaria de apresentar minha candidatura para ${job.title}. ${plain(content.profile.intro)}\n\n${matchedKeywords.length ? `Meu perfil e meus projetos incluem ${matchedKeywords.slice(0, 8).join(", ")}. ` : ""}Compartilho meu currículo e portfólio para avaliação e fico à disposição para conversar sobre a oportunidade.\n\n${content.profile.name}`,
    sources: counts });
}
