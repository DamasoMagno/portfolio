"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, FolderKanban, LayoutDashboard, Mail, UserRound, Wrench, BookOpen, ArrowUpRight, BarChart3, Handshake, FileText } from "lucide-react";
export const sections = [
  { slug: "", label: "Visão geral", icon: LayoutDashboard }, { slug: "analytics", label: "Analytics", icon: BarChart3, Handshake, FileText },
  { slug: "posts", label: "Posts", icon: FileText },
  { slug: "vagas", label: "Vagas", icon: Briefcase },
  { slug: "servicos", label: "Serviços", icon: Handshake },
  { slug: "curriculo", label: "Currículo", icon: FileText },
  { slug: "perfil", label: "Perfil", icon: UserRound },
  { slug: "projetos", label: "Projetos", icon: FolderKanban }, { slug: "habilidades", label: "Habilidades", icon: Wrench },
  { slug: "experiencias", label: "Experiências", icon: Briefcase }, { slug: "recomendacoes", label: "Recomendações", icon: BookOpen },
  { slug: "mensagens", label: "Mensagens", icon: Mail },
];
export function BackofficeNavigation() {
  const pathname = usePathname();
  return <nav aria-label="Navegação do backoffice" className="flex gap-1 overflow-x-auto border-b border-white/[0.06] px-4 py-3 lg:flex-col lg:border-b-0 lg:p-4">{sections.map(({ slug, label, icon: Icon }) => <Link key={slug} href={`/backoffice${slug ? `/${slug}` : ""}`} aria-current={pathname === `/backoffice${slug ? `/${slug}` : ""}` ? "page" : undefined} className={`flex shrink-0 items-center gap-3 whitespace-nowrap rounded-lg px-4 py-3 text-sm transition ${pathname === `/backoffice${slug ? `/${slug}` : ""}` ? "border border-primary/20 bg-primary/10 text-primary" : "border border-transparent text-text-secondary hover:bg-white/[0.03] hover:text-white"}`}><Icon size={18} strokeWidth={1.5} />{label}</Link>)}<Link href="/" target="_blank" className="mt-auto flex items-center gap-3 whitespace-nowrap rounded-lg px-4 py-3 text-sm text-text-secondary hover:text-white"><ArrowUpRight size={18} />Ver portfólio</Link></nav>;
}
