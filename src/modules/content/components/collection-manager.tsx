"use client";
import { useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Search, Trash2, X, Eye, EyeOff } from "lucide-react";
import { ImageUploadField } from "@/modules/media/components/image-upload-field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { saveBackoffice, refreshBackoffice } from "@/modules/backoffice/services/client";
import type { ContentResource, PortfolioContent } from "../schemas/content";
import { editorConfig } from "./editor-config";

type Draft = Record<string, string | boolean>;
export function CollectionManager({ resource, initialData }: { resource: ContentResource; initialData: PortfolioContent }) {
  const config = editorConfig[resource];
  const [content, setContent] = useState(initialData);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editing, setEditing] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const busy = loading || uploading;
  const [feedback, setFeedback] = useState({ error: false, text: "" });
  const entries = content[resource];
  const normal = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const visible = entries.filter((item) => normal(JSON.stringify(item)).includes(normal(search.trim())) && (filter === "all" || item.published === (filter === "published")));

  function open(item?: typeof entries[number]) {
    const fields = item as unknown as Record<string, unknown> | undefined;
    const next: Draft = { published: item?.published ?? false };
    for (const field of config.fields) {
      const value = ["github", "demo"].includes(field.key) ? (fields?.links as Record<string, string> | undefined)?.[field.key] : fields?.[field.key];
      next[field.key] = Array.isArray(value) ? value.join(field.key === "tasks" ? "\n" : ", ") : String(value ?? field.options?.[0]?.value ?? "");
    }
    setDraft(next); setEditing(item?.id); setFeedback({ error: false, text: "" });
  }
  async function mutate(input: unknown, success: string) {
    setLoading(true); setFeedback({ error: false, text: "" });
    try { setContent(await saveBackoffice(resource, input)); setFeedback({ error: false, text: success }); return true; }
    catch (error) { setFeedback({ error: true, text: error instanceof Error ? error.message : "Não foi possível salvar." }); return false; }
    finally { setLoading(false); }
  }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!draft || busy) return;
    const value: Record<string, unknown> = { published: draft.published };
    for (const field of config.fields) {
      const raw = String(draft[field.key] ?? "");
      value[field.key] = field.type === "list" || field.key === "tasks" ? raw.split(field.key === "tasks" ? "\n" : ",").map((item) => item.trim()).filter(Boolean) : raw;
    }
    if (resource === "projects") { value.links = { github: value.github, demo: value.demo }; delete value.github; delete value.demo; }
    if (await mutate({ action: "save", data: value, id: editing, revision: content.revision }, "Conteúdo salvo. O portfólio já reflete a publicação.")) { setDraft(null); setEditing(undefined); }
  }
  async function move(id: string, direction: number) {
    const ids = entries.map((item) => item.id); const index = ids.indexOf(id); const target = index + direction;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    await mutate({ action: "reorder", ids, revision: content.revision }, "Ordem atualizada.");
  }
  return <div className="space-y-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-bold tracking-tight">{config.title}</h1><p className="mt-3 text-sm text-text-secondary">{config.description}</p></div><Button onClick={() => open()} disabled={busy || Boolean(draft)}><Plus size={17} />Adicionar {config.singular}</Button></div>
    {feedback.text && <p role={feedback.error ? "alert" : "status"} className={`rounded-lg border p-4 text-sm ${feedback.error ? "border-red-400/20 bg-red-400/5 text-red-200" : "border-emerald-400/20 bg-emerald-400/5 text-emerald-200"}`}>{feedback.text}</p>}
    {draft && <section className="rounded-2xl border border-primary/30 bg-surface p-5 md:p-7"><div className="mb-6 flex items-center justify-between"><h2 className="text-lg font-bold">{editing ? "Editar" : "Adicionar"} {config.singular}</h2><Button aria-label="Fechar formulário" disabled={busy} onClick={() => setDraft(null)} className="bg-transparent p-2 hover:bg-white/5"><X size={18} /></Button></div><form onSubmit={submit} className="grid gap-5 md:grid-cols-2">{config.fields.map((field) => field.key === "cover" ? <ImageUploadField key={field.key} id={field.key} label={field.label} value={String(draft[field.key])} purpose="projects" onChange={value => setDraft(current => current ? ({ ...current, [field.key]: value }) : null)} onBusyChange={setUploading} disabled={loading} /> : <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}><label htmlFor={field.key} className="mb-2 block text-sm text-text-secondary">{field.label}{field.required && " *"}</label>{field.type === "textarea" ? <textarea id={field.key} rows={4} required={field.required} maxLength={8000} disabled={busy} value={String(draft[field.key])} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })} className="w-full rounded-lg border border-white/10 bg-background p-3 text-sm outline-none focus:border-primary" /> : field.type === "select" ? <select id={field.key} disabled={busy} value={String(draft[field.key])} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })} className="w-full rounded-lg border border-white/10 bg-background p-3 text-sm">{field.options?.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select> : <Input id={field.key} required={field.required} type={field.type === "url" ? "url" : "text"} disabled={busy} value={String(draft[field.key])} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })} />}{field.hint && <p className="mt-2 text-xs text-text-secondary">{field.hint}</p>}</div>)}<label className="flex items-center gap-3 text-sm md:col-span-2"><input type="checkbox" checked={Boolean(draft.published)} disabled={busy} onChange={(event) => setDraft({ ...draft, published: event.target.checked })} className="h-4 w-4 accent-primary" />Publicado no portfólio</label><p className="text-xs text-text-secondary md:col-span-2">Desmarque para manter como rascunho.</p><div className="flex gap-3 md:col-span-2"><Button disabled={busy} type="submit">{loading ? "Salvando…" : "Salvar"}</Button><Button disabled={busy} type="button" onClick={() => setDraft(null)} className="bg-transparent text-text-secondary hover:bg-white/5">Cancelar</Button></div></form></section>}
    <div className="flex flex-wrap items-center gap-3"><div className="relative min-w-0 flex-1"><Search size={16} className="absolute left-3 top-3 text-text-secondary" /><Input aria-label="Buscar registros" placeholder="Buscar registros…" value={search} onChange={(event) => setSearch(event.target.value)} className="pl-10" /></div><select aria-label="Filtrar publicação" value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-lg border border-white/[0.06] bg-[#18181b]/90 p-3 text-sm"><option value="all">Todos os registros</option><option value="published">Publicados</option><option value="draft">Rascunhos</option></select><Button disabled={busy} className="bg-surface text-text-secondary hover:bg-white/5" onClick={async () => { try { setContent(await refreshBackoffice()); setFeedback({ error: false, text: "Lista atualizada." }); } catch { setFeedback({ error: true, text: "Não foi possível atualizar." }); } }}>Atualizar</Button></div>
    <p className="text-xs text-text-secondary" aria-live="polite">{visible.length} registros · a ordem da lista define a ordem no portfólio</p>
    <div className="space-y-3">{visible.map((item) => { const fields = item as unknown as Record<string, unknown>; const title = String(fields[config.titleKey]); const position = entries.findIndex((entry) => entry.id === item.id); return <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-[#18181b]/90 p-5"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-3"><h2 className="text-sm font-bold">{title}</h2><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] ${item.published ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-200"}`}>{item.published ? <Eye size={11} /> : <EyeOff size={11} />}{item.published ? "Publicado" : "Rascunho"}</span></div><p className="mt-2 line-clamp-2 text-xs text-text-secondary">{String(fields.company ?? fields.description ?? (fields.tags as string[])?.join(", ") ?? "")}</p></div><div className="flex flex-wrap gap-1">{resource === "skills" && <Button type="button" aria-label={`${item.published ? "Esconder" : "Mostrar"} ${title} no portfólio`} aria-pressed={item.published} disabled={busy || Boolean(draft)} className="bg-transparent text-text-secondary hover:bg-white/5" onClick={() => void mutate({ action: "save", id: item.id, data: { ...item, published: !item.published }, revision: content.revision }, `${title} ${item.published ? "oculto" : "visível"} no portfólio.`)}>{item.published ? <EyeOff size={15} /> : <Eye size={15} />}{item.published ? "Esconder" : "Mostrar"}</Button>}<Button aria-label={`Mover ${title} para cima`} disabled={busy || position === 0 || Boolean(draft)} className="bg-transparent p-2 text-text-secondary hover:bg-white/5" onClick={() => move(item.id, -1)}><ArrowUp size={16} /></Button><Button aria-label={`Mover ${title} para baixo`} disabled={busy || position === entries.length - 1 || Boolean(draft)} className="bg-transparent p-2 text-text-secondary hover:bg-white/5" onClick={() => move(item.id, 1)}><ArrowDown size={16} /></Button><Button aria-label={`Editar ${title}`} disabled={busy || Boolean(draft)} className="bg-primary/10 p-2 text-primary hover:bg-primary/20" onClick={() => open(item)}><Pencil size={16} /></Button><Button aria-label={`Excluir ${title}`} disabled={busy || Boolean(draft)} className="bg-transparent p-2 text-red-300 hover:bg-red-400/10" onClick={async () => { if (window.confirm(`Excluir “${title}”? Essa ação remove o conteúdo do portfólio.`)) await mutate({ action: "delete", id: item.id, revision: content.revision }, "Registro excluído."); }}><Trash2 size={16} /></Button></div></article>; })}{!visible.length && <p className="rounded-xl border border-dashed border-white/10 p-10 text-center text-sm text-text-secondary">Nenhum registro encontrado.</p>}</div>
  </div>;
}
