"use client";

import type { ProjectWorkType } from "@/interfaces/project";
import { useEffect, useRef, useState } from "react";

const workTypeLabels: Record<ProjectWorkType, string> = {
  freelance: "Freelance",
  emprego: "Emprego",
  projeto_pessoal: "Projeto pessoal",
  estagio: "Estágio",
};

type ExperienceItem = {
  role: string;
  company: string;
  period: string;
  description: string;
  tags: string[];
  tasks: string[];
  workType: ProjectWorkType;
};

const experiences: ExperienceItem[] = [
  {
    role: "Desenvolvedor Full Stack",
    company: "Frete Mais",
    period: "Nov 2024 — Presente",
    description:
      "Atuo como Desenvolvedor Full Stack em uma logtech, no desenvolvimento de uma plataforma de logística que conecta empresas e motoristas, desde os estágios iniciais do produto. Comecei como Desenvolvedor Mobile (nov 2024 — nov 2025) e, em seguida, passei a atuar também no backend e no frontend web. Trabalho com Java 17, Spring Boot e Nest no backend, Next.js e React Native com Expo no frontend web e mobile. Londrina, Paraná · Remoto.",
    tasks: [
      "Implemento e evoluo funcionalidades no frontend web e no backend, incluindo autenticação, documentos e fluxos de negócio.",
      "Desenvolvo e integro APIs REST, pagamentos e serviços externos.",
      "Atuo em melhorias de performance, refatoração e estabilidade em produção, com monitoramento de erros e pipelines de CI.",
      "Garanto qualidade com testes e logging estruturado para observabilidade da aplicação.",
    ],
    tags: [
      "Java 17",
      "Spring Boot",
      "Nest",
      "Next.js",
      "React Native",
      "Expo",
      "TypeScript",
    ],
    workType: "emprego",
  },
  {
    role: "Desenvolvedor Full Stack",
    company: "ClicaEPede",
    period: "Ago 2024 — Nov 2024",
    description:
      "Atuei na evolução de um cardápio digital para restaurante português, assumindo um projeto já existente e focando em performance, acessibilidade e experiência de uso. Portugal · Remoto.",
    tasks: [
      "Refatorei a aplicação de Next.js para React, com melhoria de ~100% na performance e estrutura mais simples.",
      "Melhorei acessibilidade e responsividade, tornando a navegação mais clara em desktop e mobile.",
      "Refatorei regras de negócio no frontend, corrigi bugs e implementei novas funcionalidades.",
      "Integrei o cardápio ao Strapi e PostgreSQL para gestão do conteúdo.",
    ],
    tags: ["React.js", "Strapi", "PostgreSQL"],
    workType: "freelance",
  },
  {
    role: "Desenvolvedor Full Stack",
    company: "Prista Fórmulas",
    period: "Fev 2024 — Ago 2024",
    description:
      "Desenvolvi uma plataforma para farmácia de manipulação voltada ao controle de visitas médicas — website/painel e aplicativo em React Native — com análise dos dados coletados em campo. Itapipoca, Ceará · Remoto.",
    tasks: [
      "Desenvolvi o aplicativo em React Native (Expo) para coleta de dados em campo e o painel web de gestão.",
      "Entreguei dashboard com indicadores, gráficos, metas, buscas e filtros.",
      "Implementei cadastros, validações, APIs REST, paginação com cache e regras de negócio da operação.",
    ],
    tags: ["React.js", "TypeScript", "React Native", "Expo"],
    workType: "freelance",
  },
  {
    role: "Desenvolvedor Full Stack",
    company: "Newbyte",
    period: "Nov 2023 — Jan 2024",
    description:
      "Desenvolvi um e-commerce de eletrônicos, atuando na interface, integrações e fluxos de compra. Itapipoca, Ceará · Remoto.",
    tasks: [
      "Implementei catálogo, carrinho, cupons, autenticação e checkout.",
      "Estruturei os fluxos entre frontend, backend e serviços externos (CMS, WhatsApp e PIX).",
    ],
    tags: ["CSS", "TypeScript"],
    workType: "freelance",
  },
  {
    role: "Desenvolvedor Full Stack",
    company: "Paypercash",
    period: "Set 2021 — Jan 2022",
    description:
      "Desenvolvi um sistema de Help Desk para gestão de suporte técnico focado em unidades de saúde e pronto atendimento. Implementei o fluxo completo: interface para abertura de chamados nas unidades e painel administrativo para os técnicos realizarem a triagem e atendimento das solicitações. Itapipoca, Ceará · Presencial.",
    tasks: [],
    tags: ["Spring Boot", "CSS"],
    workType: "estagio",
  },
];

export function Experience() {
  const [visible, setVisible] = useState(true);
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

  return (
    <section
      id="experience"
      ref={ref}
      className="py-20 px-6 border-t border-white/[0.05]"
    >
      <div className="max-w-[896px] mx-auto">
        <div className="flex flex-col items-center gap-12">
          <div
            className={`flex flex-col items-center gap-4 transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-[30px] font-bold text-[#e1e1e6] leading-[1.2]">
              Experiência Profissional
            </h2>
          </div>

          <div className="flex flex-col gap-8 w-full">
            {experiences.map((exp, index) => (
              <div
                key={index}
                className={`p-8 rounded-2xl bg-[#18181b] border border-white/[0.05] transition-all duration-500 hover:border-white/10 hover:bg-[#1a1a1e] hover:shadow-xl hover:-translate-y-1 ${
                  visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-bold text-[#e1e1e6]">
                        {exp.role}
                      </h3>
                      <span className="px-3 py-1.5 rounded-full bg-white/[0.1] backdrop-blur-sm border border-white/10 text-xs font-medium text-[#e1e1e6]">
                        {workTypeLabels[exp.workType]}
                      </span>
                    </div>
                    <span className="px-4 py-1.5 rounded-full bg-[#121214] border border-white/[0.05] text-sm text-[#a8a8b3]">
                      {exp.period}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-[#8257e6]">
                    {exp.company}
                  </p>

                  <p className="text-base text-[#a8a8b3] leading-[1.625]">
                    {exp.description}
                  </p>

                  {exp.tasks.length > 0 && (
                    <ul className="flex flex-col gap-2 list-disc pl-5 text-sm text-[#a8a8b3] leading-[1.625]">
                      {exp.tasks.map((task) => (
                        <li key={task}>{task}</li>
                      ))}
                    </ul>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {exp.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 text-xs font-medium text-[#8257e6] bg-[#8257e6]/10 rounded-md border border-[#8257e6]/20"
                      >
                        {tag}
                      </span>
                    ))}
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
