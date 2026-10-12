"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BackofficeBackdrop } from "./backdrop";

export function Login({ configured }: { configured: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const response = await fetch("/api/backoffice/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      router.replace("/backoffice"); router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Não foi possível entrar."); }
    finally { setLoading(false); }
  }
  return <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-12">
    <BackofficeBackdrop />
    <div className="relative w-full max-w-[440px]">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-text-secondary transition hover:text-white"><ArrowLeft size={16} />Voltar ao portfólio</Link>
      <section className="rounded-[2rem] border border-white/[0.06] bg-[#18181b]/90 p-7 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary"><LockKeyhole size={25} strokeWidth={1.5} /></div>
        <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">Área privada</span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Seu espaço de criação.</h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">Entre para cuidar dos projetos e histórias que fazem parte do seu portfólio.</p>
        {configured ? <form onSubmit={submit} className="mt-8 space-y-5">
          <div><label htmlFor="email" className="mb-2 block text-sm text-text-secondary">E-mail</label><Input id="email" type="email" autoComplete="username" required disabled={loading} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Seu e-mail de administrador" className="h-12 border-white/[0.06] bg-background/80" /></div>
          <div><label htmlFor="password" className="mb-2 block text-sm text-text-secondary">Senha</label><div className="relative"><Input id="password" type={visible ? "text" : "password"} autoComplete="current-password" required disabled={loading} value={password} onChange={(event) => setPassword(event.target.value)} aria-describedby={error ? "login-error" : undefined} className="h-12 border-white/[0.06] bg-background/80 pr-12" /><button type="button" aria-label={visible ? "Ocultar senha" : "Mostrar senha"} aria-pressed={visible} onClick={() => setVisible(!visible)} className="absolute right-3 top-3.5 text-text-secondary hover:text-white">{visible ? <EyeOff size={19} /> : <Eye size={19} />}</button></div></div>
          {error && <p id="login-error" role="alert" className="rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2 text-sm text-red-300">{error}</p>}
          <Button className="h-12 w-full rounded-xl" disabled={loading}>{loading ? "Entrando…" : <>Entrar no backoffice<ArrowRight size={17} /></>}</Button>
        </form> : <p className="mt-6 text-sm leading-6 text-text-secondary">O acesso administrativo ainda não está configurado neste ambiente.</p>}
        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-text-secondary"><ShieldCheck size={14} />Acesso exclusivo do administrador</p>
      </section>
    </div>
  </main>;
}
