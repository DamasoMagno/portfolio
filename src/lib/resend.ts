import { Resend } from "resend";

export function createResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

export function getResendEnv(): {
  from: string;
  to: string;
} | null {
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.trim();
  if (!from || !to) return null;
  return { from, to };
}

/** Para mensagens de diagnóstico (apenas em desenvolvimento). */
export function getMissingContactEnvVars(): string[] {
  const missing: string[] = [];
  if (!process.env.RESEND_API_KEY?.trim()) missing.push("RESEND_API_KEY");
  if (!process.env.RESEND_FROM_EMAIL?.trim()) missing.push("RESEND_FROM_EMAIL");
  if (!process.env.CONTACT_TO_EMAIL?.trim()) missing.push("CONTACT_TO_EMAIL");
  return missing;
}
