"use client";
import { useState } from "react";
import { FileText, Upload, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { refreshBackoffice } from "@/modules/backoffice/services/client";
import type { PortfolioContent } from "@/modules/content/schemas/content";
export function ResumeManager({ initialData }: { initialData: PortfolioContent }) {
  const [content, setContent] = useState(initialData), [file, setFile] = useState<File | null>(null), [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState({ text: "", error: false }), [inputKey, setInputKey] = useState(0);
  async function upload() {
    if (!file || busy) return;
    if (file.type !== "application/pdf" || file.size > 4 * 1024 * 1024 || !file.size) { setFeedback({ text: "Selecione um PDF de até 4 MB.", error: true }); return; }
    setBusy(true); setFeedback({ text: "", error: false });
    try {
      const body = new FormData(); body.set("file", file); body.set("revision", String(content.revision));
      const response = await fetch("/api/backoffice/resume", { method: "POST", body }); const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Não foi possível enviar o currículo.");
      setContent(result.data); setFile(null); setInputKey(key => key + 1); setFeedback({ text: "Currículo publicado. O botão Baixar CV já usa o novo PDF.", error: false });
    } catch (error) { setFeedback({ text: error instanceof Error ? error.message : "Não foi possível enviar.", error: true }); }
    finally { setBusy(false); }
  }
  return <div className="max-w-3xl space-y-6"><header><h1 className="text-3xl font-bold tracking-tight">Currículo</h1><p className="mt-3 text-sm leading-6 text-text-secondary">Envie o PDF que deseja disponibilizar no seu portfólio.</p></header>
    {feedback.text && <p role={feedback.error ? "alert" : "status"} className={`rounded-xl border border-white/10 p-4 text-sm ${feedback.error ? "text-red-200" : "text-emerald-200"}`}>{feedback.text}</p>}
    <section className="space-y-5 rounded-2xl border border-white/10 bg-surface p-6"><h2 className="flex items-center gap-2 text-base font-medium"><FileText size={18} className="text-primary" />Currículo atual</h2><a href={content.profile.resume} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary">Abrir PDF atual<ArrowUpRight size={15} /></a><p className="text-xs leading-5 text-text-secondary">O PDF é público e fica disponível pelo botão “Baixar CV”. O envio substitui o link no perfil, preservando suas outras informações.</p></section>
    <form onSubmit={event => { event.preventDefault(); void upload(); }} className="space-y-5 rounded-2xl border border-white/10 bg-surface p-6"><label htmlFor="resume-pdf" className="block text-sm font-medium">Novo currículo em PDF</label><input key={inputKey} id="resume-pdf" type="file" accept="application/pdf,.pdf" required disabled={busy} onChange={event => { setFile(event.target.files?.[0] ?? null); setFeedback({ text: "", error: false }); }} className="block w-full text-sm text-text-secondary file:mr-4 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-primary" /><p className="text-xs text-text-secondary">Até 4 MB · PDF sem senha</p><div className="flex flex-wrap gap-3"><Button type="submit" disabled={busy || !file}><Upload size={16} />{busy ? "Enviando…" : "Enviar e publicar currículo"}</Button><Button type="button" disabled={busy} className="bg-transparent hover:bg-white/5" onClick={async () => { setBusy(true); try { setContent(await refreshBackoffice()); setFeedback({ text: "Versão do perfil atualizada. Você pode enviar o PDF.", error: false }); } catch { setFeedback({ text: "Não foi possível atualizar.", error: true }); } finally { setBusy(false); } }}>Atualizar versão</Button></div></form>
  </div>;
}
