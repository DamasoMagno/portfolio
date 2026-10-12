"use client";
import { useState, type FormEvent } from "react";
import { ImageUploadField } from "@/modules/media/components/image-upload-field";
import { Input } from "@/components/ui/Input";
import { FormattedText } from "@/components/ui/FormattedText";
import { Button } from "@/components/ui/Button";
import { saveBackoffice, refreshBackoffice } from "@/modules/backoffice/services/client";
import type { PortfolioContent } from "../schemas/content";

export function ProfileManager({ initialData }: { initialData: PortfolioContent }) {
  const [content, setContent] = useState(initialData);
  const [profile, setProfile] = useState(initialData.profile);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const busy = loading || uploading;
  const [feedback, setFeedback] = useState({ error: false, text: "" });
  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy) return; setLoading(true); setFeedback({ error: false, text: "" });
    try { const result = await saveBackoffice("profile", { data: profile, revision: content.revision }); setContent(result); setFeedback({ error: false, text: "Perfil atualizado no portfólio." }); }
    catch (error) { setFeedback({ error: true, text: error instanceof Error ? error.message : "Não foi possível salvar." }); }
    finally { setLoading(false); }
  }
  const fields = [{ key: "name", label: "Nome", type: "text" }, { key: "headline", label: "Título profissional", type: "text" }, { key: "email", label: "E-mail de contato", type: "email" }, { key: "whatsapp", label: "WhatsApp com DDI (somente números)", type: "text" }, { key: "avatar", label: "URL ou caminho da foto", type: "text" }, { key: "resume", label: "URL ou caminho do currículo", type: "text" }, { key: "github", label: "GitHub", type: "url" }, { key: "linkedin", label: "LinkedIn", type: "url" }] as const;
  return <div className="space-y-6"><div><h1 className="text-3xl font-bold tracking-tight">Perfil</h1><p className="mt-3 text-sm text-text-secondary">Edite sua apresentação, biografia, foto e canais de contato.</p></div>{feedback.text && <p role={feedback.error ? "alert" : "status"} className={`rounded-lg border border-white/10 p-4 text-sm ${feedback.error ? "text-red-200" : "text-emerald-200"}`}>{feedback.text}</p>}<form onSubmit={submit} className="grid gap-5 rounded-2xl border border-white/[0.06] bg-[#18181b]/90 p-5 md:grid-cols-2 md:p-7">{fields.map((field) => field.key === "avatar" ? <ImageUploadField key={field.key} id="avatar" label="Foto do perfil" value={profile.avatar} purpose="profile" onChange={value => setProfile(current => ({ ...current, avatar: value }))} onBusyChange={setUploading} disabled={loading} required /> : <div key={field.key}><label htmlFor={field.key} className="mb-2 block text-sm text-text-secondary">{field.label}</label><Input id={field.key} type={field.type} required={!['github', 'linkedin'].includes(field.key)} disabled={busy} value={profile[field.key]} onChange={(event) => setProfile({ ...profile, [field.key]: event.target.value })} /></div>)}<div className="md:col-span-2"><label htmlFor="intro" className="mb-2 block text-sm text-text-secondary">Apresentação</label><textarea id="intro" rows={3} required value={profile.intro} disabled={busy} onChange={(event) => setProfile({ ...profile, intro: event.target.value })} className="w-full rounded-lg border border-white/10 bg-background p-3 text-sm" /></div><div className="md:col-span-2"><label htmlFor="about" className="mb-2 block text-sm text-text-secondary">Sobre mim</label><textarea id="about" rows={7} maxLength={80000} required disabled={busy} value={profile.about.join("\n\n")} onChange={(event) => setProfile({ ...profile, about: [event.target.value] })} className="w-full rounded-lg border border-white/10 bg-background p-3 text-sm" /><p className="mt-2 text-xs text-text-secondary">As quebras de linha são preservadas. Use **negrito**, *itálico*, - para listas e [texto](https://…) para links.</p><div className="mt-5 rounded-lg border border-white/10 bg-background p-4"><p className="mb-3 text-xs text-text-secondary">Prévia no portfólio</p><FormattedText text={profile.about.join("\n\n")} /></div></div><div className="md:col-span-2"><Button disabled={busy} type="submit">{loading ? "Salvando…" : "Salvar perfil"}</Button><Button type="button" disabled={busy} className="ml-3 bg-transparent hover:bg-white/5" onClick={async () => { try { const result = await refreshBackoffice(); setContent(result); setFeedback({ error: false, text: "Versão atualizada. Seus campos foram preservados; confira antes de salvar." }); } catch { setFeedback({ error: true, text: "Não foi possível atualizar." }); } }}>Atualizar versão</Button></div></form></div>;
}
