"use client";
import { useMemo, useState } from "react";
import { ArrowDown, Search, X } from "lucide-react";
import type { Project } from "@/interfaces/project";
import { PortfolioContainer } from "./ui/PortfolioContainer";
import { ProjectCard } from "./projects/project-card";
import { ProjectDetails } from "./projects/project-details";

const pageSize = 6;
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
export function Projects({ projects }: { projects: Project[] }) {
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(pageSize);
  const [selected, setSelected] = useState<Project | null>(null);
  const categories = Array.from(new Set(projects.flatMap(project => project.category)));
  const filtered = useMemo(() => projects.filter(project => (!category || project.category.includes(category)) && normalize(`${project.title} ${project.description} ${project.tags.join(" ")}`).includes(normalize(search.trim()))), [projects, category, search]);
  const displayed = filtered.slice(0, limit);
  return <section id="projects" className="scroll-mt-28 border-t border-white/[0.05] px-6 py-20"><PortfolioContainer>
    <div className="mb-10 flex flex-wrap items-end justify-between gap-5"><div className="max-w-xl"><h2 className="text-3xl font-bold tracking-tight">Projetos</h2><p className="mt-3 text-sm leading-6 text-text-secondary">Aplicações que desenvolvi em projetos pessoais, freelance e no trabalho.</p></div><p className="text-xs text-text-secondary">{projects.length} projetos no portfólio</p></div>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-5"><nav aria-label="Filtrar projetos por categoria" className="flex flex-wrap gap-2"><button type="button" aria-pressed={!category} onClick={() => { setCategory(null); setLimit(pageSize); }} className={`rounded-full border px-4 py-2.5 text-xs transition ${!category ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 text-text-secondary hover:text-white"}`}>Todos<span className="ml-2 opacity-60">{projects.length}</span></button>{categories.map(value => <button type="button" key={value} aria-pressed={category === value} onClick={() => { setCategory(value); setLimit(pageSize); }} className={`rounded-full border px-4 py-2.5 text-xs transition ${category === value ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 text-text-secondary hover:text-white"}`}>{value}<span className="ml-2 opacity-60">{projects.filter(project => project.category.includes(value)).length}</span></button>)}</nav><div className="relative w-full sm:w-72"><Search size={16} className="pointer-events-none absolute left-3.5 top-3.5 text-text-secondary" /><input type="search" aria-label="Buscar projetos" placeholder="Buscar projeto ou tecnologia…" value={search} onChange={event => { setSearch(event.target.value); setLimit(pageSize); }} className="w-full rounded-xl border border-white/10 bg-[#18181b] py-3 pl-10 pr-3 text-sm outline-none focus:border-primary" /></div></div>
    <p aria-live="polite" className="mb-6 text-xs text-text-secondary">{filtered.length ? `Mostrando ${displayed.length} de ${filtered.length} projetos${category ? ` em ${category}` : ""}` : "Nenhum projeto encontrado"}</p>
    {displayed.length ? <div className="grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">{displayed.map(project => <ProjectCard key={project.id ?? project.title} project={project} onDetails={() => setSelected(project)} />)}</div> : <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center"><Search className="mx-auto mb-4 text-primary" size={26} /><p className="text-sm text-text-secondary">Tente outra tecnologia ou categoria para encontrar um projeto.</p>{(search || category) && <button className="mx-auto mt-5 inline-flex items-center gap-2 text-sm text-primary" onClick={() => { setSearch(""); setCategory(null); setLimit(pageSize); }}><X size={14} />Limpar filtros</button>}</div>}
    {displayed.length < filtered.length && <div className="mt-9 text-center"><button onClick={() => setLimit(limit + pageSize)} className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-6 py-3 text-sm text-primary transition hover:bg-primary/20">Ver mais projetos<ArrowDown size={16} /></button><p className="mt-3 text-xs text-text-secondary">{filtered.length - displayed.length} projetos para explorar</p></div>}
    {selected && <ProjectDetails project={selected} onClose={() => setSelected(null)} />}
  </PortfolioContainer></section>;
}
