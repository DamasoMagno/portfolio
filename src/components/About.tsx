"use client";

import { useEffect, useRef, useState } from "react";

export function About() {
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
      { threshold: 0.2 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={ref}
      className="py-20 px-6 border-t border-white/[0.05]"
    >
      <div className="max-w-[768px] mx-auto">
        <div
          className={`flex flex-col items-center gap-8 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex flex-col items-center gap-4 relative">
            <h2 className="text-[30px] font-bold text-[#e1e1e6] leading-[1.2]">
              Sobre mim
            </h2>
            <div className="absolute -bottom-3 w-[158px] h-[4px] bg-[#8257e6] rounded-full opacity-50" />
          </div>

          <div className="flex flex-col gap-6 text-center">
            <p className="text-lg text-[#a8a8b3] leading-[1.625]">
              Desenvolvedor Full Stack com experiência no desenvolvimento de
              aplicações web e mobile utilizando React, Next.js, React Native,
              Node.js e Nest. Atuo na construção de soluções com foco em
              performance, organização de código, componentização e boas
              práticas de desenvolvimento.{" "}
            </p>

            <p className="text-lg text-[#a8a8b3] leading-[1.625]">
              Tenho experiência na implementação e evolução de funcionalidades,
              integrações entre sistemas e consumo de APIs REST, atuando tanto
              na criação de interfaces modernas e responsivas quanto na
              manutenção e melhoria contínua de aplicações.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
