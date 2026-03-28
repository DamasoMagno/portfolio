"use client";

import { Download, Github, Linkedin, Twitter, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

export function Hero() {
  const [mounted, setMounted] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeout(() => setAvatarLoaded(true), 200);
  }, []);

  return (
    <section className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center px-6 pt-20 pb-10">
      <div className="flex flex-col items-center gap-8 max-w-[576px] mx-auto">
        <div
          className={`relative transition-all duration-700 ${
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`}
        >
          <div className="absolute inset-0 bg-[#8257e6]/20 rounded-[2rem] blur-2xl scale-90" />
          <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-[2rem] overflow-hidden border-2 border-white/[0.1] shadow-2xl bg-[#202024] z-10 hover:scale-105 transition-transform duration-500">
            <img
              src="https://github.com/DamasoMagno.png"
              alt="Damaso Magno"
              className="w-full h-full object-cover"
              onLoad={() => setAvatarLoaded(true)}
            />
          </div>
        </div>

        <div
          className={`flex flex-col items-center gap-3 transition-all duration-700 delay-200 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span className="px-4 py-1.5 text-[12px] font-bold tracking-[1.2px] text-[#8257e6] bg-[#8257e6]/10 rounded-full border border-[#8257e6]/20">
            FULL STACK DEVELOPER
          </span>
          <h1 className="text-[72px] font-bold text-[#e1e1e6] tracking-tight leading-none text-center">
            Damaso Magno
          </h1>
        </div>

        <p
          className={`text-xl text-[#a8a8b3] text-center leading-[1.625] max-w-[500px] transition-all duration-700 delay-300 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Transformando ideias complexas em soluções digitais completas, do frontend ao backend.
        </p>

        <div
          className={`flex items-center gap-4 pt-4 transition-all duration-700 delay-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <button className="group flex items-center gap-2 px-8 py-3.5 bg-[#e1e1e6] text-[#121214] font-bold text-base rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.05)] hover:bg-white hover:shadow-lg hover:scale-105 transition-all duration-300">
            <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform duration-300" />
            Baixar CV
          </button>

          <div className="flex items-center gap-4">
            {[
              { icon: Github, href: "#" },
              { icon: Linkedin, href: "#" },
              { icon: Twitter, href: "#" },
            ].map((social, index) => (
              <a
                key={index}
                href={social.href}
                className="group w-11 h-11 rounded-full bg-[#202024] border border-white/[0.05] flex items-center justify-center hover:bg-white/[0.05] hover:border-white/10 hover:scale-110 hover:shadow-lg transition-all duration-300"
              >
                <social.icon className="w-5 h-5 text-[#a8a8b3] group-hover:text-white transition-colors duration-300" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
