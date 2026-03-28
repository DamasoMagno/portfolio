"use client";

import { Mail, MessageCircle, Send } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

export function Contact() {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitState, setSubmitState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");
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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitState("loading");
    setSubmitMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        hint?: string;
        missingEnv?: string[];
      };

      if (!res.ok) {
        setSubmitState("error");
        const parts = [
          data.error ?? "Não foi possível enviar. Tente novamente.",
          data.missingEnv?.length
            ? `Faltando: ${data.missingEnv.join(", ")}.`
            : null,
          data.hint ?? null,
        ].filter(Boolean);
        setSubmitMessage(parts.join(" "));
        return;
      }

      setSubmitState("success");
      setSubmitMessage("Mensagem enviada. Obrigado pelo contato!");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setSubmitState("error");
      setSubmitMessage("Erro de rede. Verifique sua conexão.");
    }
  }

  return (
    <section id="contact" ref={ref} className="py-20 px-6 border-t border-white/[0.05]">
      <div className="max-w-[1152px] mx-auto">
        <div className="flex flex-col lg:flex-row items-start justify-center gap-24">
          <div
            className={`flex flex-col gap-10 max-w-[528px] transition-all duration-700 ${
              visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <div className="flex flex-col gap-3">
              <span className="text-sm font-bold tracking-[0.7px] text-[#8257e6] uppercase">
                Contato
              </span>
              <h2 className="text-[36px] font-bold text-[#e1e1e6] leading-[1.11]">
                Vamos conversar?
              </h2>
              <p className="text-lg text-[#a8a8b3] leading-[1.625]">
                Tem uma ideia de projeto ou quer apenas trocar uma ideia?
                Estou disponível para novos desafios. Entre em contato pelos
                canais abaixo ou preencha o formulário.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <a
                href="mailto:damasomagno@gmail.com"
                className="group flex items-center gap-4 p-4 rounded-xl bg-[#18181b] border border-white/[0.05] shadow-[0_1px_4px_rgba(0,0,0,0.05)] hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-[#8257e6]/20 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-[#8257e6]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#a8a8b3]">E-mail</span>
                  <span className="text-base font-medium text-[#e1e1e6] group-hover:text-[#8257e6] transition-colors duration-300">
                    damasomagno@gmail.com
                  </span>
                </div>
              </a>

              <a
                href="#"
                className="group flex items-center gap-4 p-4 rounded-xl bg-[#18181b] border border-white/[0.05] shadow-[0_1px_4px_rgba(0,0,0,0.05)] hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-[#8257e6]/20 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-[#8257e6]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#a8a8b3]">WhatsApp</span>
                  <span className="text-base font-medium text-[#e1e1e6] group-hover:text-[#8257e6] transition-colors duration-300">
                    +55 (88) 99601-8788
                  </span>
                </div>
              </a>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className={`flex flex-col gap-5 w-full max-w-[528px] transition-all duration-700 delay-200 ${
              visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="contact-name" className="text-sm font-medium text-[#a8a8b3]">
                Nome
              </label>
              <input
                id="contact-name"
                type="text"
                name="name"
                required
                maxLength={200}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitState === "loading"}
                placeholder="Seu nome"
                className="px-4 py-3.5 rounded-lg bg-[#202024] border border-white/[0.05] text-[#e1e1e6] placeholder:text-[#6b7280] focus:outline-none focus:border-[#8257e6] focus:ring-1 focus:ring-[#8257e6]/30 transition-all duration-300 disabled:opacity-60"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="contact-email" className="text-sm font-medium text-[#a8a8b3]">
                E-mail
              </label>
              <input
                id="contact-email"
                type="email"
                name="email"
                required
                maxLength={320}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitState === "loading"}
                placeholder="seu@email.com"
                className="px-4 py-3.5 rounded-lg bg-[#202024] border border-white/[0.05] text-[#e1e1e6] placeholder:text-[#6b7280] focus:outline-none focus:border-[#8257e6] focus:ring-1 focus:ring-[#8257e6]/30 transition-all duration-300 disabled:opacity-60"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="contact-message" className="text-sm font-medium text-[#a8a8b3]">
                Mensagem
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                maxLength={8000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={submitState === "loading"}
                placeholder="Escreva sua mensagem aqui..."
                rows={5}
                className="px-4 py-3.5 rounded-lg bg-[#202024] border border-white/[0.05] text-[#e1e1e6] placeholder:text-[#6b7280] focus:outline-none focus:border-[#8257e6] focus:ring-1 focus:ring-[#8257e6]/30 transition-all duration-300 resize-none disabled:opacity-60"
              />
            </div>

            {submitMessage ? (
              <p
                className={`text-sm ${
                  submitState === "success" ? "text-emerald-400" : "text-red-400"
                }`}
                role="status"
              >
                {submitMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitState === "loading"}
              className="group flex items-center justify-center gap-2 w-full py-4 bg-[#8257e6] text-white font-bold text-base rounded-lg hover:bg-[#6d46c9] hover:shadow-[0_4px_12px_rgba(130,87,230,0.4)] active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none"
            >
              {submitState === "loading" ? "Enviando…" : "Enviar Mensagem"}
              <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
