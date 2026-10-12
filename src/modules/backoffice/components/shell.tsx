import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { hasBackofficeAccess } from "../services/access";
import { publicContent } from "@/modules/content/services/content";
import { BackofficeNavigation } from "./navigation";
import { Logout } from "./logout";
import { BackofficeBackdrop } from "./backdrop";

export async function BackofficeShell({ children }: { children: React.ReactNode }) {
  if (!(await hasBackofficeAccess())) redirect("/backoffice/login");
  const { profile } = await publicContent();
  return <div className="relative min-h-screen bg-background">
    <BackofficeBackdrop />
    <div className="relative mx-auto max-w-[1440px] px-4 pb-8 pt-5 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-[#18181b]/80 px-5 py-4 shadow-lg backdrop-blur-xl md:rounded-full md:px-6">
        <div className="flex items-center gap-3"><img src={profile.avatar} alt="" className="h-10 w-10 rounded-full border border-white/10 object-cover" /><div><p className="text-sm font-bold">{profile.name}</p><p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-primary">Portfolio · Backoffice</p></div></div>
        <div className="flex items-center gap-3"><Link href="/" target="_blank" className="hidden items-center gap-2 rounded-full border border-white/[0.06] px-4 py-2 text-xs text-text-secondary transition hover:border-primary/30 hover:text-white sm:inline-flex">Ver portfólio<ArrowUpRight size={14} /></Link><Logout /></div>
      </header>
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
        <aside className="min-w-0 rounded-2xl border border-white/[0.06] bg-[#18181b]/80 backdrop-blur-xl lg:sticky lg:top-6"><BackofficeNavigation /><div className="m-4 hidden items-center gap-2 border-t border-white/[0.06] pt-4 text-[10px] text-text-secondary lg:flex"><ShieldCheck size={14} className="text-primary" />Sessão administrativa protegida</div></aside>
        <main className="min-w-0 py-2 md:py-4">{children}</main>
      </div>
    </div>
  </div>;
}
