"use client";

import { useEffect, useRef, useState } from "react";

const skillCategories = [
  {
    title: "Frontend",
    tags: [
      "React",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "HTML5",
      "CSS3",
      "Styled Components",
      "Shadcn UI",
      "Radix",
      "Zod",
      "React Hook Form",
      "Framer Motion",
      "Zustand",
      "Tanstack Query",
      "Design Systems",
    ],
  },
  {
    title: "Mobile",
    tags: [
      "React Native",
      "Expo",
      "Android Studio",
      "Async Storage",
      "Push Notifications",
      "React Navigation",
      "Play Store",
      "App Store",
    ],
  },
  {
    title: "Backend",
    tags: [
      "Node.js",
      "Express",
      "Fastify",
      "Java",
      "Spring Boot",
      "Jest",
      "JPA",
      "Hibernate",
      "Scalar",
      "Swagger",
      "JWT",
      "Prisma",
      "SOLID",
      "TDD",
    ],
  },
  {
    title: "Banco de Dados",
    tags: ["PostgreSQL", "MongoDB", "MySQL", "Firebase", "Supabase"],
  },
  {
    title: "DevOps & Ferramentas",
    tags: [
      "Git",
      "Docker",
      "Figma",
      "Vercel",
      "Cloudflare",
      "Render",
      "CI/CD",
      "AWS",
    ],
  },
];

function SkillTag({ name }: { name: string }) {
  return (
    <span className="px-3 py-1.5 rounded-md bg-[#8257e6]/10 border border-[#8257e6]/20 text-[10px] font-extrabold text-[#8257e6] tracking-tight leading-tight whitespace-nowrap">
      {name}
    </span>
  );
}

function SkillCard({
  category,
  visible,
  index,
}: {
  category: (typeof skillCategories)[0];
  visible: boolean;
  index: number;
}) {
  const renderTags = () => {
    return (
      <div className="flex flex-wrap gap-2">
        {category.tags.map((tag, i) => (
          <SkillTag key={i} name={tag} />
        ))}
      </div>
    );
  };

  return (
    <div
      className={`p-8 rounded-2xl bg-[#18181b] border border-white/[0.05] transition-all duration-500 hover:border-white/10 hover:bg-[#1a1a1e] hover:shadow-xl hover:-translate-y-1 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex flex-col gap-6">
        <h3 className="text-[20px] font-bold text-[#e1e1e6] leading-[1.4] border-l-4 border-[#8257e6] pl-4">
          {category.title}
        </h3>
        {renderTags()}
      </div>
    </div>
  );
}

export function Skills() {
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
      { threshold: 0.1 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="skills"
      ref={ref}
      className="py-20 px-6 md:px-[134px] border-t border-white/[0.05]"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col items-center gap-12">
          <div
            className={`flex flex-col items-center gap-4 transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-[30px] font-bold text-[#e1e1e6] leading-[1.2]">
              Minhas Habilidades
            </h2>
            <div className="w-[64px] h-[4px] bg-[#8257e6] rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skillCategories.map((category, index) => (
              <SkillCard
                key={index}
                category={category}
                visible={visible}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
