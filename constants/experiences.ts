import type { Experience } from "../src/modules/content/schemas/content";
export const experiences: Omit<Experience, "published">[] = [
  {
    role: "Desenvolvedor Full Stack",
    company: "Frete Mais",
    period: "Nov 2024 — Presente",
    description:
      "Atuo como Desenvolvedor Full Stack em uma logtech, no desenvolvimento de uma plataforma de logística que conecta empresas e motoristas, desde os estágios iniciais do produto. Comecei como Desenvolvedor Mobile (nov 2024 — nov 2025) e, em seguida, passei a atuar também no backend e no frontend web. Trabalho com Java 17, Spring Boot e Nest no backend, Next.js e React Native com Expo no frontend web e mobile. Londrina, Paraná · Remoto.",
    tasks: [
      "Implemento e evoluo funcionalidades no frontend web e no backend, incluindo autenticação, documentos e fluxos de negócio.",
      "Desenvolvo e integro APIs REST, pagamentos e serviços externos.",
      "Atuo em melhorias de performance, refatoração e estabilidade em produção, com monitoramento de erros e pipelines de CI.",
      "Garanto qualidade com testes e logging estruturado para observabilidade da aplicação.",
    ],
    tags: [
      "Java 17",
      "Spring Boot",
      "Nest",
      "Next.js",
      "React Native",
      "Expo",
      "TypeScript",
    ],
    workType: "emprego",
  },
  {
    role: "Desenvolvedor Full Stack",
    company: "ClicaEPede",
    period: "Ago 2024 — Nov 2024",
    description:
      "Atuei na evolução de um cardápio digital para restaurante português, assumindo um projeto já existente e focando em performance, acessibilidade e experiência de uso. Portugal · Remoto.",
    tasks: [
      "Refatorei a aplicação de Next.js para React, com melhoria de ~100% na performance e estrutura mais simples.",
      "Melhorei acessibilidade e responsividade, tornando a navegação mais clara em desktop e mobile.",
      "Refatorei regras de negócio no frontend, corrigi bugs e implementei novas funcionalidades.",
      "Integrei o cardápio ao Strapi e PostgreSQL para gestão do conteúdo.",
    ],
    tags: ["React.js", "Strapi", "PostgreSQL"],
    workType: "freelance",
  },
  {
    role: "Desenvolvedor Full Stack",
    company: "Prista Fórmulas",
    period: "Fev 2024 — Ago 2024",
    description:
      "Desenvolvi uma plataforma para farmácia de manipulação voltada ao controle de visitas médicas — website/painel e aplicativo em React Native — com análise dos dados coletados em campo. Itapipoca, Ceará · Remoto.",
    tasks: [
      "Desenvolvi o aplicativo em React Native (Expo) para coleta de dados em campo e o painel web de gestão.",
      "Entreguei dashboard com indicadores, gráficos, metas, buscas e filtros.",
      "Implementei cadastros, validações, APIs REST, paginação com cache e regras de negócio da operação.",
    ],
    tags: ["React.js", "TypeScript", "React Native", "Expo"],
    workType: "freelance",
  },
  {
    role: "Desenvolvedor Full Stack",
    company: "Newbyte",
    period: "Nov 2023 — Jan 2024",
    description:
      "Desenvolvi um e-commerce de eletrônicos, atuando na interface, integrações e fluxos de compra. Itapipoca, Ceará · Remoto.",
    tasks: [
      "Implementei catálogo, carrinho, cupons, autenticação e checkout.",
      "Estruturei os fluxos entre frontend, backend e serviços externos (CMS, WhatsApp e PIX).",
    ],
    tags: ["CSS", "TypeScript"],
    workType: "freelance",
  },
  {
    role: "Desenvolvedor Full Stack",
    company: "Paypercash",
    period: "Set 2021 — Jan 2022",
    description:
      "Desenvolvi um sistema de Help Desk para gestão de suporte técnico focado em unidades de saúde e pronto atendimento. Implementei o fluxo completo: interface para abertura de chamados nas unidades e painel administrativo para os técnicos realizarem a triagem e atendimento das solicitações. Itapipoca, Ceará · Presencial.",
    tasks: [],
    tags: ["Spring Boot", "CSS"],
    workType: "estagio",
  },
];
