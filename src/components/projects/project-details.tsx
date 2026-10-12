"use client";
import { useEffect, useRef } from "react";
import { ArrowUpRight, Github, X } from "lucide-react";
import type { Project } from "@/interfaces/project";
import { workTypeLabels } from "./project-card";
export function ProjectDetails({ project, onClose }: { project: Project; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = previousOverflow; };
  }, []);
  return (
    <dialog ref={dialog} aria-labelledby="project-details-title" aria-describedby="project-details-description" onClose={event => { if (!event.currentTarget.open) onClose(); }} onClick={event => { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose(); }} className="fixed m-auto max-h-[85svh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-xl border border-white/10 bg-[#18181b] p-0 text-text-primary shadow-2xl backdrop:bg-black/75">
      <div className="p-6 sm:p-8">
        <div className="mb-5 flex items-start justify-between gap-4">
          <p className="text-xs text-text-secondary">{project.category.join(" · ")} · {workTypeLabels[project.workType]}</p>
          <button type="button" autoFocus aria-label="Fechar detalhes do projeto" onClick={onClose} className="rounded-lg p-2 text-text-secondary hover:bg-white/5 hover:text-white"><X size={20} /></button>
        </div>
        <h2 id="project-details-title" className="break-words text-3xl font-bold leading-tight">{project.title}</h2>
        <p id="project-details-description" className="mt-4 whitespace-pre-line text-base leading-7 text-text-secondary">{project.description}</p>
        {project.cover && <img src={project.cover} alt={`Tela pública do projeto ${project.title}`} width={1280} height={800} className="mt-6 w-full rounded-lg border border-white/10" />}
        {[{ title: "Contexto e problema", text: project.context }, { title: "Minha participação", text: project.contribution }, { title: "Resultado", text: project.outcome }].filter(section => section.text).map(section => <section key={section.title} className="mt-6"><h3 className="text-sm font-medium">{section.title}</h3><p className="mt-2 whitespace-pre-line text-sm leading-7 text-text-secondary">{section.text}</p></section>)}
        {project.tags.length > 0 && <div className="mt-6"><h3 className="text-sm font-medium">Tecnologias utilizadas</h3><p className="mt-2 text-sm leading-7 text-text-secondary">{project.tags.join(" · ")}</p></div>}
        <div className="mt-7 flex flex-wrap gap-3 border-t border-white/10 pt-6">
          {project.links.demo && <a href={project.links.demo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white hover:bg-[#9469f5]">Abrir projeto<ArrowUpRight size={16} /></a>}
          {project.links.github && <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-5 py-3 text-sm text-text-secondary hover:text-white"><Github size={16} />Ver código</a>}
          {!project.links.demo && !project.links.github && <p className="text-sm text-text-secondary">Este projeto ainda não possui links públicos.</p>}
        </div>
      </div>
    </dialog>
  );
}
