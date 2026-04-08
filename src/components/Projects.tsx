"use client";

import type { ProjectWorkType } from "@/interfaces/project";
import { ExternalLink, Github } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { projects } from "../../constants/projects";

const workTypeLabels: Record<ProjectWorkType, string> = {
  freelance: "Freelance",
  emprego: "Emprego",
  projeto_pessoal: "Projeto pessoal",
  estagio: "Estágio",
};

const categories = ["Full Stack", "Frontend", "Backend"];
type Category = (typeof categories)[number] | "";

export function Projects() {
  const [visible, setVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>("Full Stack");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const filteredProjects = useMemo(() => {
    if (activeCategory === "Todas") {
      return projects;
    }
    return projects.filter((project) =>
      project.category.includes(activeCategory),
    );
  }, [activeCategory]);

  return (
    <section
      ref={ref}
      className="py-20 px-6 border-t border-white/[0.05]"
      id="projects"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col items-center gap-12">
          <div
            className={`flex flex-col items-center gap-4 transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-[30px] font-bold text-[#e1e1e6] leading-[1.2]">
              Projetos em Destaque
            </h2>
            <div className="w-[64px] h-1 bg-[#8257e6] rounded-full" />
            <p className="text-base text-[#a8a8b3] text-center max-w-[500px]">
              Uma seleção de projetos que demonstram minha paixão por resolver
              problemas.
            </p>
          </div>

          <div
            className={`flex flex-wrap justify-center items-center gap-2 p-1 bg-[#202024] rounded-xl border border-white/[0.05] shadow-[0_1px_4px_rgba(0,0,0,0.05)] transition-all duration-700 delay-200 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() =>
                  setActiveCategory(category === "Todas" ? "Todas" : category)
                }
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeCategory === category
                    ? "bg-[#8257e6] text-white shadow-[0_2px_8px_rgba(130,87,230,0.3)]"
                    : "text-[#a8a8b3] hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {filteredProjects.map((project, index) => (
              <div
                key={index}
                className={`group rounded-2xl bg-[#18181b] border border-white/[0.05] overflow-hidden transition-all duration-500 hover:border-white/10 hover:shadow-xl hover:-translate-y-2 ${
                  visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 100 + 300}ms` }}
              >
                <div className="relative h-[208px] bg-[#202024] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#8257e6]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl font-bold text-[#e1e1e6]/10 group-hover:text-[#e1e1e6]/20 transition-colors duration-500">
                      {project.title.charAt(0)}
                    </span>
                  </div>

                  <div className="absolute left-4 top-4 px-3 py-1.5 rounded-full bg-white/[0.1] backdrop-blur-sm border border-white/10">
                    <span className="text-xs font-medium text-[#e1e1e6]">
                      {workTypeLabels[project.workType]}
                    </span>
                  </div>

                  {project.category.map((cat) => (
                    <div className="absolute ml-4 top-4 right-4 px-3 py-1.5 rounded-full bg-white/[0.1] backdrop-blur-sm border border-white/10">
                      <span className="text-xs font-medium text-white">
                        {cat}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-6 flex flex-col gap-4">
                  <h3 className="text-xl font-bold text-[#e1e1e6] group-hover:text-[#8257e6] transition-colors duration-300">
                    {project.title}
                  </h3>
                  <p className="text-sm text-[#a8a8b3]">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 text-xs font-medium text-[#8257e6] bg-[#8257e6]/10 rounded-md border border-[#8257e6]/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <a
                      href={project.links.github}
                      className="flex items-center gap-2 text-sm font-medium text-[#a8a8b3] hover:text-[#8257e6] transition-colors duration-300"
                    >
                      <Github className="w-4 h-4" />
                      Código
                    </a>
                    <a
                      href={project.links.demo}
                      className="flex items-center gap-2 text-sm font-medium text-[#a8a8b3] hover:text-[#8257e6] transition-colors duration-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Demo
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
