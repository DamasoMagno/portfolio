import { randomUUID } from "node:crypto";
import { z } from "zod";
import { messageSchema } from "@/modules/content/schemas/content";
import { mutateContent } from "@/modules/content/repositories/content-repository";

export async function recordMessage(body: unknown, delivery: "backoffice" | "local" | "sent" | "failed" = "backoffice") {
  const fields = messageSchema.parse(body);
  const message = { ...fields, id: randomUUID(), status: "new" as const, delivery, createdAt: new Date().toISOString() };
  await mutateContent((content) => { content.messages.unshift(message); });
  return message;
}
export async function updateMessage(body: unknown) {
  const input = z.object({ id: z.string(), status: z.enum(["new", "read", "archived"]), revision: z.number().int().nonnegative() }).parse(body);
  return mutateContent((content) => {
    const message = content.messages.find((item) => item.id === input.id);
    if (!message) throw new Error("Mensagem não encontrada.");
    message.status = input.status;
  }, input.revision);
}
