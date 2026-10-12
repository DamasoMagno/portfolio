import { services } from "../../../../constants/services";
import { projects } from "../../../../constants/projects";
import { skillCategories } from "../../../../constants/skills";
import { experiences } from "../../../../constants/experiences";
import { courses } from "../../../../constants/recommendations";
import { contentSchema, type PortfolioContent } from "../schemas/content";

export function initialContent(): PortfolioContent {
  const entries = <T extends object>(values: T[], prefix: string) => values.map((value, index) => ({ ...value, id: `${prefix}-${index + 1}`, published: true }));
  return contentSchema.parse({ version: 1, revision: 0, updatedAt: null,
    profile: {
      name: "Damaso Magno", headline: "Full Stack Developer", intro: "Desenvolvo aplicações web, mobile e APIs. Também trabalho em projetos freelance.",
      about: ["Sou desenvolvedor Full Stack. Trabalho com React, Next.js e React Native nas interfaces, e Node.js e Nest no backend.", "Meu trabalho vai da criação de funcionalidades e integração de APIs à manutenção de aplicações. Gosto de código organizado, componentes reutilizáveis e interfaces que sejam simples de usar."],
      avatar: "/avatar.jpg", resume: "/Damaso-Magno-Desenvolvedor-Full-Stack.pdf", email: "damaso.magn@gmail.com", whatsapp: "5588996018788",
      github: "https://github.com/DamasoMagno", linkedin: "https://www.linkedin.com/in/damasomagno/",
    },
    projects: entries(projects, "project"), skills: entries(skillCategories, "skill"),
    experiences: entries(experiences, "experience"), recommendations: entries(courses, "recommendation"), services: entries(services, "service"), messages: [],
  });
}
