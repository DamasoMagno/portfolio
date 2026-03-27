"use client";

import { Play, Book, Code2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const courses = [
  {
    title: "React Native Expert",
    description: "Domine a criação de apps mobile do zero ao avançado com React Native e Expo.",
    icon: Play,
  },
  {
    title: "Full Stack Master",
    description: "Aprenda a stack completa de JavaScript, do Frontend ao Backend com Node.js.",
    icon: Code2,
  },
  {
    title: "Clean Code & Architecture",
    description: "Melhore a qualidade do seu código e aprenda padrões de arquitetura corporativa.",
    icon: Book,
  },
];

export function Recommendations() {
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
    <section ref={ref} className="py-20 px-6 border-t border-white/[0.05] opacity-60">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col items-center gap-12">
          <div
            className={`flex flex-col items-center gap-3 transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#202024] border border-[#e5e7eb] flex items-center justify-center">
                <Book className="w-6 h-6 text-[#e1e1e6]" />
              </div>
            </div>
            <h2 className="text-[20px] font-bold text-[#e1e1e6] leading-[1.4]">
              Recomendações de Estudo
            </h2>
            <p className="text-xs text-[#a8a8b3] text-center max-w-[400px] leading-[1.33]">
              Cursos de alta qualidade que indico para quem busca acelerar o aprendizado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {courses.map((course, index) => (
              <div
                key={index}
                className={`p-6 rounded-2xl bg-[#18181b] border border-[#e5e7eb]/20 flex flex-col gap-4 transition-all duration-500 hover:border-[#e5e7eb]/30 hover:-translate-y-1 ${
                  visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <course.icon className="w-12 h-12 text-[#8257e6]" />
                  <span className="px-3 py-1 rounded-md bg-[#8257e6]/20 text-xs font-medium text-[#8257e6]">
                    INDISPONÍVEL
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#e1e1e6]">{course.title}</h3>
                <p className="text-xs text-[#a8a8b3] leading-[1.62]">
                  {course.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
