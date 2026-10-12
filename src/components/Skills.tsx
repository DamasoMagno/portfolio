"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PortfolioContainer } from "./ui/PortfolioContainer";
import type { SkillGroup } from "@/modules/content/schemas/content";
export function Skills({ skillCategories }: { skillCategories: SkillGroup[] }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = skillCategories.some(category => category.tags.length > 4);
  return <section id="skills" className="scroll-mt-28 border-t border-white/[0.05] px-6 py-16"><PortfolioContainer>
    <div className="mb-8"><h2 className="text-3xl font-bold tracking-tight">Minhas habilidades</h2><p className="mt-3 text-sm text-text-secondary">Tecnologias que uso no desenvolvimento dos meus projetos.</p></div>
    <div id="skills-list" className="divide-y divide-white/[0.06]">{skillCategories.map((category, index) => <article key={`${category.title}-${index}`} className="grid gap-3 py-5 md:grid-cols-[220px_minmax(0,1fr)] md:gap-8"><h3 className="text-sm font-medium">{category.title}</h3><ul aria-label={`Tecnologias de ${category.title}`} className="flex flex-wrap gap-x-5 gap-y-2">{category.tags.slice(0, expanded ? undefined : 4).map((tag, index) => <li key={`${tag}-${index}`} className="max-w-full break-words text-sm leading-6 text-text-secondary">{tag}</li>)}</ul></article>)}</div>
    {hasMore && <button type="button" aria-expanded={expanded} aria-controls="skills-list" onClick={() => setExpanded(!expanded)} className="mt-6 inline-flex items-center gap-2 text-xs text-text-secondary hover:text-white">{expanded ? "Mostrar apenas as principais" : "Ver stack completa"}<ChevronDown size={14} className={`transition ${expanded ? "rotate-180" : ""}`} /></button>}
    {!skillCategories.length && <p className="text-sm text-text-secondary">As habilidades serão apresentadas aqui em breve.</p>}
  </PortfolioContainer></section>;
}
