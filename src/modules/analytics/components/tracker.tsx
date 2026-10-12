"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { analyticsContext, trackEvent } from "../services/browser";
import type { AnalyticsEvent } from "../schemas/event";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const sent = useRef<string | null>(null);
  useEffect(() => {
    if (!analyticsContext()) return;
    if (sent.current !== pathname) { sent.current = pathname; trackEvent("pageview"); }
    function clicked(event: MouseEvent) {
      const anchor = event.target instanceof Element ? event.target.closest("a") : null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      let label: AnalyticsEvent["label"];
      if (anchor.closest("#services")) label = "Serviços: contato";
      else if (anchor.getAttribute("href")?.startsWith("/blog/")) label = "Post";
      else if (anchor.hasAttribute("download")) label = "Currículo";
      else if (href.startsWith("mailto:")) label = "E-mail";
      else {
        try {
          const url = new URL(href, location.href);
          if (url.origin === location.origin && href.startsWith("#")) label = ({ "#": "Seção: Início", "#about": "Seção: Sobre", "#skills": "Seção: Habilidades", "#projects": "Seção: Projetos", "#experience": "Seção: Experiência", "#contact": "Seção: Contato", "#services": "Seção: Serviços", "#posts": "Seção: Posts" } as Record<string, AnalyticsEvent["label"]>)[href];
          else if (anchor.closest("#projects")) label = url.hostname === "github.com" ? "Código do projeto" : "Demo do projeto";
          else if (url.hostname === "github.com") label = "GitHub";
          else if (url.hostname === "linkedin.com" || url.hostname.endsWith(".linkedin.com")) label = "LinkedIn";
          else if (["wa.me", "api.whatsapp.com"].includes(url.hostname)) label = "WhatsApp";
          else if (anchor.closest("#recommendations")) label = "Recomendação";
        } catch { return; }
      }
      if (label) trackEvent("click", label);
    }
    document.addEventListener("click", clicked);
    return () => document.removeEventListener("click", clicked);
  }, [pathname]);
  return null;
}
