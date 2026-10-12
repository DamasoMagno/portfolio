"use client";
import { useId, useState } from "react";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { IMAGE_ACCEPT, IMAGE_TYPES, MAX_IMAGE_BYTES, type ImagePurpose, type UploadedImage } from "../schemas/image";

type Props = { id: string; label: string; value: string; purpose: ImagePurpose; onChange(value: string): void; onBusyChange?(busy: boolean): void; disabled?: boolean; required?: boolean };
export function ImageUploadField({ id, label, value, purpose, onChange, onBusyChange, disabled, required }: Props) {
  const fileId = useId();
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  async function upload(file?: File) {
    if (!file || busy || disabled) return;
    setError("");
    if (!IMAGE_TYPES.includes(file.type as typeof IMAGE_TYPES[number])) { setError("Use uma imagem JPEG, PNG, WebP ou AVIF."); return; }
    if (file.size > MAX_IMAGE_BYTES) { setError("A imagem deve ter no máximo 4 MB."); return; }
    setBusy(true); onBusyChange?.(true);
    try {
      const form = new FormData(); form.set("file", file); form.set("purpose", purpose);
      const response = await fetch("/api/backoffice/images", { method: "POST", body: form });
      const body: { data?: UploadedImage; error?: string } = await response.json();
      if (!response.ok || !body.data?.url) throw new Error(body.error ?? "Não foi possível enviar a imagem.");
      onChange(body.data.url);
    } catch (error) { setError(error instanceof Error ? error.message : "Não foi possível enviar a imagem."); }
    finally { setBusy(false); onBusyChange?.(false); }
  }
  const preview = value.startsWith("/") && !value.startsWith("//") || /^https?:\/\//i.test(value);
  return <div className="space-y-3">
    <div><label htmlFor={id} className="mb-2 block text-sm text-text-secondary">{label}</label><Input id={id} value={value} required={required} disabled={disabled || busy} placeholder="Envie uma imagem ou informe uma URL" onChange={event => { onChange(event.target.value); setError(""); }} /></div>
    <div className="flex flex-wrap items-center gap-3">
      <label htmlFor={fileId} aria-disabled={disabled || busy} className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-text-secondary hover:bg-white/5 ${disabled || busy ? "pointer-events-none opacity-50" : ""}`}><Upload size={14} />{busy ? "Enviando imagem…" : "Enviar imagem"}</label>
      <input id={fileId} type="file" accept={IMAGE_ACCEPT} aria-label={`Enviar imagem: ${label}`} disabled={disabled || busy} className="sr-only" onChange={event => { const file = event.currentTarget.files?.[0]; event.currentTarget.value = ""; void upload(file); }} />
      <span className="text-xs text-text-secondary">JPEG, PNG, WebP ou AVIF · até 4 MB</span>
    </div>
    {busy && <p role="status" className="text-xs text-text-secondary">Enviando imagem…</p>}
    {error && <p role="alert" className="text-xs text-red-200">{error}</p>}
    {preview && <img key={value} src={value} alt={`Prévia: ${label}`} className={`max-h-40 max-w-full border border-white/10 object-contain ${purpose === "profile" ? "h-24 w-24 rounded-full object-cover" : "rounded-lg"}`} />}
    <p className="text-xs text-text-secondary">Após enviar, salve o formulário para aplicar a imagem.</p>
  </div>;
}
