import { ArrowDown, Download, Github, Linkedin } from "lucide-react";
import { PortfolioContainer } from "@/components/ui/PortfolioContainer";
import type { Profile } from "@/modules/content/schemas/content";

export function Hero({ profile }: { profile: Profile }) {
  return (
    <section className="px-6 pb-14 pt-28 sm:pt-32 sm:pb-16">
      <PortfolioContainer className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_240px] md:gap-16">
        <div className="min-w-0">
          <p className="mb-3 text-sm text-text-secondary">{profile.headline}</p>
          <h1 className="break-words text-4xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-6xl lg:text-7xl">{profile.name}</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-text-secondary sm:text-lg">{profile.intro}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a href="#projects" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#9469f5]">Ver projetos<ArrowDown size={16} /></a>
            <a href={profile.resume} download={`${profile.name} - CV.pdf`} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-5 py-3 text-sm text-text-primary transition-colors hover:bg-white/5"><Download size={16} />Baixar CV</a>
            <div className="flex items-center gap-1">
              {[{ icon: Github, href: profile.github, label: `GitHub de ${profile.name}` }, { icon: Linkedin, href: profile.linkedin, label: `LinkedIn de ${profile.name}` }].filter(social => social.href).map(social => <a key={social.label} href={social.href} aria-label={social.label} title={social.label} target="_blank" rel="noopener noreferrer" className="rounded-lg p-3 text-text-secondary transition-colors hover:bg-white/5 hover:text-white"><social.icon size={20} /></a>)}
            </div>
          </div>
        </div>
        <div className="row-start-1 md:col-start-2 md:row-start-1 md:justify-self-end">
          <img src={profile.avatar} alt={profile.name} width={224} height={224} className="h-24 w-24 rounded-full border border-white/10 object-cover sm:h-40 sm:w-40 md:h-56 md:w-56" />
        </div>
      </PortfolioContainer>
    </section>
  );
}
