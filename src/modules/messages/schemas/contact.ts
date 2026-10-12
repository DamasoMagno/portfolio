import { z } from "zod";
export const projectTypes = { site: "Site ou landing page", web: "Aplicação web", mobile: "Aplicativo mobile", api: "API ou integração", manutencao: "Manutenção e evolução", outro: "Outro / ainda não sei" } as const;
export const projectTypeSchema = z.enum(["site", "web", "mobile", "api", "manutencao", "outro"]);
