import { PortfolioContainer } from "@/components/ui/PortfolioContainer";
import { FormattedText } from "@/components/ui/FormattedText";

export function About({ paragraphs }: { paragraphs: string[] }) {
  return (
    <section id="about" className="scroll-mt-28 border-t border-white/[0.06] px-6 py-16">
      <PortfolioContainer className="grid gap-6 md:grid-cols-[240px_minmax(0,1fr)] md:gap-16">
        <h2 className="text-3xl font-bold tracking-tight text-text-primary">Sobre mim</h2>
        <div className="max-w-2xl">
          <FormattedText text={paragraphs.join("\n\n")} />
        </div>
      </PortfolioContainer>
    </section>
  );
}
