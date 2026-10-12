"use client";

import {
  Briefcase,
  BookOpen,
  Handshake,
  Code,
  Folder,
  Github,
  Home,
  Linkedin,
  Mail,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const navItems = [
  { icon: Home, href: "#", label: "Início" },
  { icon: User, href: "#about", label: "Sobre" },
  { icon: Code, href: "#skills", label: "Habilidades" },
  { icon: Folder, href: "#projects", label: "Projetos" },
  { icon: Briefcase, href: "#experience", label: "Experiência" },
  { icon: Mail, href: "#contact", label: "Contato" },
];

export function Header({ profile, showPosts = false, showServices = false }: { showPosts?: boolean; showServices?: boolean; profile: import("@/modules/content/schemas/content").Profile }) {
  const rightNavItems = [
    { icon: Github, href: profile.github, label: "GitHub" },
    { icon: Linkedin, href: profile.linkedin, label: "LinkedIn" },
  ].filter((item) => item.href);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <nav
        aria-label="Navegação principal"
        className={`max-w-full overflow-x-auto flex items-center gap-1.5 px-2.5 py-2.5 rounded-full bg-white/[0.005] border border-white/[0.05] backdrop-blur-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transition-all duration-500 sm:gap-2 sm:px-4 sm:py-3 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
        style={{
          backdropFilter: "blur(10.5px)",
        }}
      >
        {[...navItems, ...(showServices ? [{ icon: Handshake, href: "#services", label: "Serviços" }] : []), ...(showPosts ? [{ icon: BookOpen, href: "#posts", label: "Posts" }] : [])].map((item, index) => (
          <Link
            key={index}
            href={item.href}
            aria-label={item.label}
            title={item.label}
            className="portfolio-nav-link group flex items-center justify-center w-9 h-9 shrink-0 rounded-full hover:bg-white/[0.05] transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px] sm:w-10 sm:h-10"
          >
            <item.icon
              className="w-4 h-4 shrink-0 text-[#a8a8b3] transition-colors duration-300 group-hover:text-white sm:w-5 sm:h-5"
              strokeWidth={1.5}
            />
            <span className="portfolio-nav-label" aria-hidden="true"><span>{item.label}</span></span>
          </Link>
        ))}

        <div className="w-px h-5 shrink-0 bg-white/[0.05] mx-0.5 sm:h-6 sm:mx-1" />

        {rightNavItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            aria-label={item.label}
            title={item.label}
            target="_blank"
            rel="noopener noreferrer"
            className="portfolio-nav-link group flex items-center justify-center w-9 h-9 shrink-0 rounded-full hover:bg-white/[0.05] transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px] sm:w-10 sm:h-10"
          >
            <item.icon
              className="w-4 h-4 shrink-0 text-[#a8a8b3] transition-colors duration-300 group-hover:text-white sm:w-5 sm:h-5"
              strokeWidth={1.5}
            />
            <span className="portfolio-nav-label" aria-hidden="true"><span>{item.label}</span></span>
          </Link>
        ))}
      </nav>
    </header>
  );
}
