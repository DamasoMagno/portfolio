"use client";
import { ArrowUpRight } from "lucide-react";
import { useState, type FormEvent } from "react";
import { PortfolioContainer } from "./ui/PortfolioContainer";
import { Input } from "./ui/Input";
import { projectTypes } from "@/modules/messages/schemas/contact";
import { analyticsContext } from "@/modules/analytics/services/browser";
import type { Profile } from "@/modules/content/schemas/content";
export function Contact({ profile }: { profile: Profile }) {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [message, setMessage] = useState("");
  const [projectType, setProjectType] = useState<keyof typeof projectTypes>("outro");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle"); const [feedback, setFeedback] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault(); if (state === "loading") return;
    setState("loading"); setFeedback("");
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, message, projectType, analytics: analyticsContext() }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Não foi possível enviar. Tente novamente.");
      setState("success"); setFeedback(data.message ?? "Mensagem enviada. Obrigado pelo contato!"); setName(""); setEmail(""); setMessage(""); setProjectType("outro");
    } catch (error) { setState("error"); setFeedback(error instanceof Error ? error.message : "Não foi possível enviar. Tente novamente."); }
  }
  return <section id="contact" className="scroll-mt-28 border-t border-white/[0.05] px-6 py-16"><PortfolioContainer><div className="grid gap-10 lg:grid-cols-2 lg:gap-20"><div><h2 className="text-3xl font-bold tracking-tight">Tem um projeto em mente?</h2><p className="mt-4 max-w-md text-sm leading-7 text-text-secondary">Me conte o que você precisa desenvolver. Podemos conversar sobre o escopo e a melhor forma de trabalhar juntos.</p><div className="mt-7 space-y-4"><a href={`mailto:${profile.email}`} className="flex w-fit max-w-full items-center gap-2 break-all text-sm text-text-secondary hover:text-white">{profile.email}<ArrowUpRight size={14} className="shrink-0" /></a><a href={`https://wa.me/${profile.whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:text-white">Conversar pelo WhatsApp<ArrowUpRight size={14} /></a></div></div><form onSubmit={submit} className="space-y-5"><div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="contact-name" className="mb-2 block text-xs text-text-secondary">Nome</label><Input id="contact-name" autoComplete="name" required maxLength={200} value={name} onChange={event => setName(event.target.value)} disabled={state === "loading"} /></div><div><label htmlFor="contact-email" className="mb-2 block text-xs text-text-secondary">E-mail</label><Input id="contact-email" type="email" autoComplete="email" required maxLength={320} value={email} onChange={event => setEmail(event.target.value)} disabled={state === "loading"} /></div></div><div><label htmlFor="contact-type" className="mb-2 block text-xs text-text-secondary">Tipo de projeto</label><select id="contact-type" value={projectType} onChange={event => setProjectType(event.target.value as keyof typeof projectTypes)} disabled={state === "loading"} className="w-full rounded-lg border border-white/10 bg-background px-3 py-2.5 text-sm outline-none focus:border-primary">{Object.entries(projectTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div><label htmlFor="contact-message" className="mb-2 block text-xs text-text-secondary">O que você precisa?</label><textarea id="contact-message" required maxLength={8000} rows={5} value={message} onChange={event => setMessage(event.target.value)} disabled={state === "loading"} placeholder="Descreva a ideia, o problema que quer resolver e, se tiver, um prazo." className="w-full resize-y rounded-lg border border-white/10 bg-background p-3 text-sm leading-6 outline-none focus:border-primary" /></div>{feedback && <p role={state === "error" ? "alert" : "status"} className={`text-sm ${state === "error" ? "text-red-300" : "text-emerald-300"}`}>{feedback}</p>}<button disabled={state === "loading"} className="rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-[#9469f5] disabled:opacity-50">{state === "loading" ? "Enviando…" : "Enviar mensagem"}</button></form></div></PortfolioContainer></section>;
}
