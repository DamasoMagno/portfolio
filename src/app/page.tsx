import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Skills } from "@/components/Skills";
import { Projects } from "@/components/Projects";
import { Experience } from "@/components/Experience";
import { Recommendations } from "@/components/Recommendations";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#121214] relative overflow-hidden">
      <div className="fixed inset-0 [background-image:radial-gradient(#a8a8b3_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.07] pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#8257e6]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#8257e6]/3 rounded-full blur-[80px]" />
      </div>

      <Header />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Experience />
      <Recommendations />
      <Contact />
      <Footer />
    </main>
  );
}
