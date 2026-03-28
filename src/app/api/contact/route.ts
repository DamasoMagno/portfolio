import {
  createResendClient,
  getMissingContactEnvVars,
  getResendEnv,
} from "@/lib/resend";
import { NextResponse } from "next/server";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const resend = createResendClient();
  const env = getResendEnv();

  if (!resend || !env) {
    const payload: Record<string, unknown> = {
      error: "Envio de e-mail não configurado no servidor.",
    };
    if (process.env.NODE_ENV === "development") {
      payload.missingEnv = getMissingContactEnvVars();
      payload.hint =
        "Na raiz do projeto, crie ou edite .env.local (use .env.example como base), defina as variáveis e reinicie npm run dev.";
    }
    return NextResponse.json(payload, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("name" in body) ||
    !("email" in body) ||
    !("message" in body)
  ) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes." }, { status: 400 });
  }

  const { name: rawName, email: rawEmail, message: rawMessage } = body as Record<
    string,
    unknown
  >;

  const name = typeof rawName === "string" ? rawName.trim() : "";
  const email = typeof rawEmail === "string" ? rawEmail.trim() : "";
  const message = typeof rawMessage === "string" ? rawMessage.trim() : "";

  if (!name || name.length > 200) {
    return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
  }
  if (!email || !EMAIL_RE.test(email) || email.length > 320) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }
  if (!message || message.length > 8000) {
    return NextResponse.json({ error: "Mensagem inválida." }, { status: 400 });
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  const { data, error } = await resend.emails.send({
    from: env.from,
    to: [env.to],
    replyTo: email,
    subject: `[Portfolio] Contato de ${name}`,
    text: `Nome: ${name}\nE-mail: ${email}\n\n${message}`,
    html: `
      <p><strong>Nome:</strong> ${safeName}</p>
      <p><strong>E-mail:</strong> ${safeEmail}</p>
      <p><strong>Mensagem:</strong></p>
      <p>${safeMessage}</p>
    `,
  });

  if (error) {
    console.error("[contact] Resend:", error);
    return NextResponse.json(
      { error: "Não foi possível enviar o e-mail. Tente novamente mais tarde." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, id: data?.id });
}
