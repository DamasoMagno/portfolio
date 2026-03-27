"use client";

import { Github, Linkedin, Home, User, Code, Folder, Mail } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const navItems = [
  { icon: Home, href: "#", label: "Home" },
  { icon: User, href: "#about", label: "About" },
  { icon: Code, href: "#skills", label: "Skills" },
  { icon: Folder, href: "#projects", label: "Projects" },
  { icon: Mail, href: "#contact", label: "Contact" },
];

const rightNavItems = [
  { icon: Github, href: "https://github.com/damasomagno", label: "GitHub" },
  {
    icon: Linkedin,
    href: "https://linkedin.com/in/damasomagno",
    label: "LinkedIn",
  },
];

export function Header() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-[508px] py-6">
      <nav
        className={`flex items-center gap-2 px-4 py-3 rounded-full bg-white/[0.005] border border-white/[0.05] backdrop-blur-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transition-all duration-500 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
        style={{
          backdropFilter: "blur(10.5px)",
        }}
      >
        {navItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            aria-label={item.label}
            className="group flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/[0.05] transition-all duration-300 hover:scale-110"
          >
            <item.icon
              className="w-5 h-5 text-[#a8a8b3] transition-colors duration-300 group-hover:text-white"
              strokeWidth={1.5}
            />
          </Link>
        ))}

        <div className="w-px h-6 bg-white/[0.05] mx-1" />

        {rightNavItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            aria-label={item.label}
            className="group flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/[0.05] transition-all duration-300 hover:scale-110"
          >
            <item.icon
              className="w-5 h-5 text-[#a8a8b3] transition-colors duration-300 group-hover:text-white"
              strokeWidth={1.5}
            />
          </Link>
        ))}
      </nav>
    </header>
  );
}
