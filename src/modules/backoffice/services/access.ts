import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual, createHash, randomUUID } from "node:crypto";

const sessionCookie = "portfolio_admin";
const sessionDuration = 12 * 60 * 60 * 1000;
const digest = (value: string) => createHash("sha256").update(value).digest();
const equal = (a: string, b: string) => timingSafeEqual(digest(a), digest(b));
const adminEmail = () => process.env.BACKOFFICE_ADMIN_EMAIL?.trim().toLowerCase() ?? "";

export function authenticationConfigured() {
  return Boolean(adminEmail() && process.env.BACKOFFICE_PASSWORD && (process.env.BACKOFFICE_SESSION_SECRET?.length ?? 0) >= 32);
}
function sign(payload: string) {
  return createHmac("sha256", process.env.BACKOFFICE_SESSION_SECRET!)
    .update(`${payload}:${digest(process.env.BACKOFFICE_PASSWORD!).toString("hex")}`).digest("hex");
}
export async function hasBackofficeAccess() {
  if (!authenticationConfigured()) return false;
  const token = (await cookies()).get(sessionCookie)?.value ?? "";
  if (token.length > 2000) return false;
  const [payload, signature, extra] = token.split(".");
  if (extra || !payload || !signature || !equal(sign(payload), signature)) return false;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return session.email === adminEmail() && Number.isSafeInteger(session.expires) && session.expires > Date.now() && session.expires <= Date.now() + sessionDuration;
  } catch { return false; }
}
export async function requireBackofficeAccess() { if (!(await hasBackofficeAccess())) throw new Error("Acesso administrativo necessário."); }
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const source = new URL(origin);
    return ["http:", "https:"].includes(source.protocol) && source.host === (request.headers.get("host") ?? new URL(request.url).host);
  } catch { return false; }
}
export function credentialsMatch(email: string, password: string) {
  if (!authenticationConfigured()) return false;
  const emailMatches = equal(email.trim().toLowerCase(), adminEmail());
  const passwordMatches = equal(password, process.env.BACKOFFICE_PASSWORD!);
  return emailMatches && passwordMatches;
}
export async function createSession() {
  const payload = Buffer.from(JSON.stringify({ email: adminEmail(), expires: Date.now() + sessionDuration, nonce: randomUUID() })).toString("base64url");
  (await cookies()).set(sessionCookie, `${payload}.${sign(payload)}`, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: sessionDuration / 1000 });
}
export async function clearSession() { (await cookies()).delete(sessionCookie); }
