import { recordMessage } from "@/modules/messages/services/messages";
import { messageSchema } from "@/modules/content/schemas/content";
import { recordContactConversion } from "@/modules/analytics/services/contact-conversion";
import { sameOrigin } from "@/modules/backoffice/services/access";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem não autorizada." }, { status: 403 });
  let body: unknown;
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > 40000) return NextResponse.json({ error: "Mensagem muito grande." }, { status: 413 });
    body = JSON.parse(raw);
  } catch { return NextResponse.json({ error: "JSON inválido." }, { status: 400 }); }
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Confira o nome, e-mail, tipo de projeto e mensagem." }, { status: 400 });
  let saved;
  try { saved = await recordMessage(parsed.data); }
  catch {
    console.error("[contact] Não foi possível salvar o contato no backoffice.");
    return NextResponse.json({ error: "Não foi possível enviar sua mensagem. Tente novamente." }, { status: 503 });
  }
  // Optional metrics must not turn an already received contact into a failed submission.
  await recordContactConversion(request, (body as Record<string, unknown>).analytics, saved.id);
  return NextResponse.json({ ok: true, id: saved.id, message: "Mensagem enviada. Obrigado pelo contato!" });
}
