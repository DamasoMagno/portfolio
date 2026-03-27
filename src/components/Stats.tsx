"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { number: "50+", label: "Projetos Finalizados" },
  { number: "3+", label: "Anos de Experiência" },
  { number: "30+", label: "Clientes Satisfeitos" },
  { number: "20+", label: "Tecnologias Dominadas" },
];

export function Stats() {
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
    <section ref={ref} className="py-16 px-6">
      <div className="max-w-[1024px] mx-auto">
        <div className="flex justify-center gap-4 flex-wrap">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`w-[236px] px-6 py-6 rounded-2xl bg-white/[0.01] border border-white/[0.05] backdrop-blur-sm transition-all duration-500 hover:border-white/10 hover:bg-white/[0.02] hover:shadow-lg hover:-translate-y-1 ${
                visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl font-bold text-[#e1e1e6]">{stat.number}</span>
                <span className="text-[10px] font-bold tracking-[1px] text-[#a8a8b3] uppercase">
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
