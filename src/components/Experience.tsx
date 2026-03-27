"use client";

import { useEffect, useRef, useState } from "react";

const experiences = [
  {
    role: "Desenvolvedor Mobile",
    company: "HackCoda",
    period: "2023 - Presente",
    description:
      "Atuação no desenvolvimento e manutenção de interfaces, garantindo a melhor experiência para o usuário final.",
    tags: ["React Native", "Expo", "TypeScript"],
  },
  {
    role: "Desenvolvedor Full Stack",
    company: "Freelancer",
    period: "2022 - 2023",
    description:
      "Desenvolvi uma plataforma para uma farmácia, composta por um website e um aplicativo. O objetivo era otimizar o controle das visitas realizadas pela equipe farmacêutica aos consultórios médicos. Implementei painéis com relatórios detalhados.",
    tags: ["React", "Node.js", "PostgreSQL"],
  },
  {
    role: "Desenvolvedor Frontend",
    company: "Projeto E-commerce",
    period: "2022",
    description:
      "Desenvolvi um e-commerce especializado em eletrônicos. Implementei carrinho de compras, cupons de desconto e integração com CMS Hygraph, além de automação de pedidos via WhatsApp.",
    tags: ["Next.js", "Hygraph", "WhatsApp API"],
  },
  {
    role: "Desenvolvedor Backend",
    company: "Projeto Corporativo",
    period: "2021",
    description:
      "Desenvolvi um painel de controle para auxiliar no gerenciamento das resoluções de problemas técnicos nas unidades filiais.",
    tags: ["Node.js", "Express", "MySQL"],
  },
];

export function Experience() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-20 px-6 border-t border-white/[0.05]">
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
                    <h3 className="text-lg font-bold text-[#e1e1e6]">{exp.role}</h3>
                    <span className="px-4 py-1.5 rounded-full bg-[#121214] border border-white/[0.05] text-sm text-[#a8a8b3]">
                      {exp.period}
                    </span>
                  </div>

                  <p className="text-base text-[#a8a8b3] leading-[1.625]">
                    {exp.description}
                  </p>

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
