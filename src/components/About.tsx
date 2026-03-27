"use client";

import { useEffect, useRef, useState } from "react";

export function About() {
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
      { threshold: 0.2 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" ref={ref} className="py-20 px-6 border-t border-white/[0.05]">
      <div className="max-w-[768px] mx-auto">
        <div
          className={`flex flex-col items-center gap-8 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex flex-col items-center gap-4 relative">
            <h2 className="text-[30px] font-bold text-[#e1e1e6] leading-[1.2]">Sobre mim</h2>
            <div className="absolute -bottom-3 w-[158px] h-[4px] bg-[#8257e6] rounded-full opacity-50" />
          </div>

          <div className="flex flex-col gap-6 text-center">
            <p className="text-lg text-[#a8a8b3] leading-[1.625]">
              Sou Desenvolvedor Full Stack com foco em React, Next.js, React Native, Expo e Node.js.
              Trabalho criando aplicações web e mobile com total atenção à performance, usabilidade
              e boas práticas de código.
            </p>

            <p className="text-lg text-[#a8a8b3] leading-[1.625]">
              Atualmente, atuo como Desenvolvedor Mobile, utilizando React Native e Expo para
              construir aplicativos modernos e escaláveis. Também trago uma bagagem de{" "}
              <span className="text-[#e1e1e6] font-bold">3 anos como freelancer</span>,
              experiência que ampliou minha visão de produto e me permitiu resolver
              desafios reais para diversos clientes.
            </p>

            <p className="text-lg text-[#a8a8b3] leading-[1.625]">
              Minha trajetória começou como estagiário atuando com React e Spring Boot. Desde
              então, sigo em evolução constante, buscando aperfeiçoar o que já sei e aprender novas
              tecnologias que me tornem um profissional cada vez mais completo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
