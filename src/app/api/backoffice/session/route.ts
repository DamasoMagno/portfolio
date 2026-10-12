import { NextResponse } from "next/server";
import { clearSession, createSession, credentialsMatch, sameOrigin } from "@/modules/backoffice/services/access";

const attempts = globalThis as typeof globalThis & { portfolioLoginAttempts?: { start: number; count: number } };
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem não autorizada." }, { status: 403 });
  const now = Date.now();
  if (!attempts.portfolioLoginAttempts || now - attempts.portfolioLoginAttempts.start > 15 * 60 * 1000) attempts.portfolioLoginAttempts = { start: now, count: 0 };
  if (attempts.portfolioLoginAttempts.count >= 8) return NextResponse.json({ error: "Muitas tentativas. Aguarde 15 minutos." }, { status: 429 });
  attempts.portfolioLoginAttempts.count += 1;
  try {
    const body = await request.json();
    if (typeof body.email !== "string" || body.email.length > 320 || typeof body.password !== "string" || body.password.length > 1000 || !credentialsMatch(body.email, body.password)) return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
    await createSession(); attempts.portfolioLoginAttempts.count = 0;
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Solicitação inválida." }, { status: 400 }); }
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem não autorizada." }, { status: 403 });
  await clearSession(); return NextResponse.json({ ok: true });
}
