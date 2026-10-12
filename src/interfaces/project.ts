export type ProjectWorkType =
  | "freelance"
  | "emprego"
  | "projeto_pessoal"
  | "estagio";

export interface Project {
  id?: string;
  title: string;
  cover?: string;
  context?: string;
  contribution?: string;
  outcome?: string;
  category: string[];
  /** Contexto do trabalho: freelance, CLT, projeto próprio, estágio etc. */
  workType: ProjectWorkType;
  description: string;
  tags: string[];
  links: { github: string; demo: string };
}
