import { Project } from "@/interfaces/project";

export const projects: Project[] = [
  {
    title: "Activer",
    category: ["Frontend"],
    workType: "projeto_pessoal",
    description:
      "Plataforma de gestão de atividades físicas com dashboard completo.",
    tags: ["React", "Next.js", "Tailwind"],
    links: {
      github: "https://github.com/DamasoMagno/activer",
      demo: "https://activer.vercel.app/signIn",
    },
  },
  {
    title: "Organage",
    category: ["Frontend"],
    workType: "projeto_pessoal",
    description:
      "Plataforma desenvolvida com foco na gerência da organização de uma escola.",
    tags: ["Typescript", "React", "GraphQL"],
    links: {
      github: "https://github.com/DamasoMagno/organage-front",
      demo: "https://organage.vercel.app/",
    },
  },
  {
    title: "TopBurguer API",
    category: ["Backend"],
    workType: "freelance",
    description:
      "API desenvolvida para o sistema de delivery TopBurguer.",
    tags: ["Java", "Spring Boot", "PostgreSQL", "Docker", "OAuth"],
    links: {
      github: "https://github.com/DamasoMagno/topburguer-api",
      demo: "",
    },
  },	
  {
    title: "PoteCake",
    category: ["Frontend"],
    workType: "freelance",
    description: "Plataforma de delivery focada em uma confeitaria regional.",
    tags: ["Next.js", "GraphQL", "Styled Components"],
    links: {
      github: "https://github.com/DamasoMagno/potecake",
      demo: "https://potecake.vercel.app",
    },
  },
  { 
    title: "MeCart",
    category: ["Frontend"],
    workType: "projeto_pessoal",
    description:
      "Sistema de criação de carrinho e inserção de produtos para controle dos gastos",
    tags: [
      "React",
      "Styled Components",
      "Zustand",
      "Zod",
      "React Hook Form",
      "React Router Dom",
      "Radix",
    ],
    links: {
      github: "https://github.com/DamasoMagno/mecart-front",
      demo: "https://mecart.vercel.app/",
    },
  },
  {
    title: "Estoquer",
    category: ["Frontend"],
    workType: "projeto_pessoal",
    description: "Estoquer",
    tags: ["Next.js", "Supabase"],
    links: {
      github: "https://github.com/DamasoMagno/estoquer-front",
      demo: "https://estoquer.vercel.app/signIn",
    },
  },
  {
    title: "BridClub",
    category: ["Full Stack"],
    workType: "emprego",
    description:
      "Sistema voltado para a gestão de barbearias, com dashboard para os barbeiros e clientes.",
    tags: [
      "Next.js",
      "Tailwind CSS",
      "Supabase",
      "Zod",
      "React Hook Form",
      "Shadcn UI",
      "Clouflare",
    ],
    links: {
      github: "",
      demo: "https://www.bridclub.com/",
    },
  },
];
