import "server-only";

export function storageProvider(): "local" | "supabase" {
  const selected = process.env.PORTFOLIO_STORAGE;
  if (selected && !["local", "supabase"].includes(selected)) throw new Error("PORTFOLIO_STORAGE deve ser local ou supabase.");
  if (selected === "local") {
    if (process.env.NODE_ENV === "production") throw new Error("Configure o Supabase para persistir os dados em produção.");
    return "local";
  }
  if (selected === "supabase" || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NODE_ENV === "production") return "supabase";
  return "local";
}

export function supabaseConfig() {
  const rawUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)?.trim();
  const key = process.env.SUPABASE_SECRET_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!rawUrl || !key) throw new Error("Configure SUPABASE_URL e SUPABASE_SECRET_KEY no ambiente do servidor.");
  let url: URL;
  try { url = new URL(rawUrl); } catch { throw new Error("SUPABASE_URL inválida."); }
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if ((url.protocol !== "https:" && !(url.protocol === "http:" && loopback && process.env.NODE_ENV !== "production")) || url.username || url.password || url.search || url.hash || url.pathname !== "/") throw new Error("SUPABASE_URL deve conter somente a origem HTTPS do projeto.");
  let serviceRole = false;
  try { serviceRole = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString()).role === "service_role"; } catch { /* Modern keys are not JWTs. */ }
  if (!key.startsWith("sb_secret_") && !serviceRole) throw new Error("Use a chave secreta do servidor, não a chave pública/anon do Supabase.");
  return { url: url.origin, key, legacy: serviceRole };
}
