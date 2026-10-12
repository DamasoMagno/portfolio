import { z } from "zod";
export const serviceSchema = z.object({
  title: z.string().trim().min(1).max(120), description: z.string().trim().min(1).max(2000),
  deliverables: z.array(z.string().trim().min(1).max(200)).max(10),
  icon: z.enum(["web", "mobile", "api", "maintenance"]), published: z.boolean().default(true),
});
export type Service = z.infer<typeof serviceSchema>;
