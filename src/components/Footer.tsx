"use client";

import { useEffect, useState } from "react";

export function Footer() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <footer
      className={`py-8 px-6 border-t border-white/[0.05] backdrop-blur-sm transition-all duration-700 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-center gap-4">
        <p className="text-sm text-[#a8a8b3]">
          © 2025 DM. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
