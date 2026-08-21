"use client";

import { Book, Code2, ExternalLink, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const courses = [
  {
    title: "Curso Web Moderno Completo com JavaScript + Projetos",
    description:
      "Do HTML ao React, Vue, Node e bancos de dados — formação completa de desenvolvimento web com projetos reais, da Cod3r.",
    instructor: "Leonardo Leitão · Cod3r",
    href: "https://www.udemy.com/course/curso-web/?couponCode=CP260817G1",
    icon: Code2,
  },
  {
    title: "The Complete JavaScript Course",
    description:
      "JavaScript do zero ao avançado: fundamentos, ES6+, assíncrono, OOP e projetos práticos para dominar a linguagem.",
    instructor: "Jonas Schmedtmann",
    href: "https://www.udemy.com/course/the-complete-javascript-course/",
    icon: Play,
  },
  {
    title: "JavaScript Ninja",
    description:
      "Aprofunda JavaScript com foco em fundamentos, boa prática e domínio real da linguagem — excelente para ir além do básico.",
    instructor: "Fernando Daciuk",
    href: "https://www.udemy.com/course/curso-javascript-ninja/",
    icon: Book,
  },
];

export function Recommendations() {
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
      id="recommendations"
      ref={ref}
      className="py-20 px-6 border-t border-white/[0.05]"
    >
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
              Cursos de alta qualidade que indico para quem busca acelerar o
              aprendizado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {courses.map((course, index) => (
              <a
                key={course.href}
                href={course.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-6 rounded-2xl bg-[#18181b] border border-[#e5e7eb]/20 flex flex-col gap-4 transition-all duration-500 hover:border-[#8257e6]/40 hover:-translate-y-1 ${
                  visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <course.icon className="w-12 h-12 text-[#8257e6]" />
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-[#8257e6]/20 text-xs font-medium text-[#8257e6]">
                    Udemy
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#e1e1e6]">
                  {course.title}
                </h3>
                <p className="text-xs text-[#8257e6]">{course.instructor}</p>
                <p className="text-xs text-[#a8a8b3] leading-[1.62]">
                  {course.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
