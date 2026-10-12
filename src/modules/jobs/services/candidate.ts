import type { PortfolioContent } from "@/modules/content/schemas/content";
import type { PostsDocument } from "@/modules/posts/schemas/post";
import type { JobInput } from "../schemas/job";
export type CandidateSource = { id: string; label: string; text: string };
export function candidateSources(content: PortfolioContent, posts: PostsDocument, job: JobInput) {
  const sources: CandidateSource[] = [
    { id: "profile", label: "Perfil / Sobre mim", text: [content.profile.headline, content.profile.intro, ...content.profile.about].join("\n") },
    ...content.experiences.map(item => ({ id: `experience:${item.id}`, label: `Experiência: ${item.role} · ${item.company}`, text: [item.role, item.company, item.period, item.description, ...item.tasks, ...item.tags].join("\n") })),
    ...content.projects.map(item => ({ id: `project:${item.id}`, label: `Projeto: ${item.title}`, text: [item.title, item.description, item.context, item.contribution, item.outcome, ...item.category, ...item.tags].join("\n") })),
    ...content.skills.map(item => ({ id: `skill:${item.id}`, label: `Habilidades: ${item.title}`, text: [item.title, ...item.tags].join("\n") })),
    ...content.services.map(item => ({ id: `service:${item.id}`, label: `Serviço: ${item.title}`, text: [item.title, item.description, ...item.deliverables].join("\n") })),
    ...content.recommendations.map(item => ({ id: `recommendation:${item.id}`, label: `Material recomendado: ${item.title}`, text: [item.title, item.instructor, item.description].join("\n") })),
    ...posts.posts.map(item => ({ id: `post:${item.id}`, label: `Post: ${item.title}`, text: [item.title, item.excerpt, item.body, ...item.tags].join("\n") })),
    ...(job.resumeText ? [{ id: "resume", label: "Texto do currículo informado", text: job.resumeText }] : []),
  ];
  return { sources, counts: { profile: 1, experiences: content.experiences.length, projects: content.projects.length, skills: content.skills.length, services: content.services.length, recommendations: content.recommendations.length, posts: posts.posts.length, resume: job.resumeText ? 1 : 0 } };
}
