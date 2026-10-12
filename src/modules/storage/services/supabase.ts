import "server-only";
import { supabaseConfig } from "./config";

// Server-only REST access keeps storage independent of the UI and owner authentication.
export async function supabaseRequest<T>(resource: string, options: { method?: "GET" | "POST"; body?: unknown } = {}): Promise<T> {
  const { url, key, legacy } = supabaseConfig();
  let response: Response;
  try {
    response = await fetch(`${url}/rest/v1/${resource}`, {
      method: options.method ?? "GET", cache: "no-store", signal: AbortSignal.timeout(15000),
      headers: { apikey: key, ...(legacy ? { Authorization: `Bearer ${key}` } : {}), "Content-Type": "application/json" },
      ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
    });
  } catch (error) {
    // Preserve Next's rendering control flow instead of reporting it as a database outage.
    const digest = (error as { digest?: string } | null)?.digest;
    if (digest === "DYNAMIC_SERVER_USAGE" || digest === "NEXT_STATIC_GEN_BAILOUT") throw error;
    throw new Error("Não foi possível conectar ao Supabase. Tente novamente.");
  }
  // Do not expose provider responses, credentials or stored data in public errors.
  if (!response.ok) throw new Error(`Falha ao acessar os dados no Supabase (HTTP ${response.status}). Confira a configuração e a migração SQL.`);
  if (response.status === 204) return undefined as T;
  try { return await response.json() as T; }
  catch { throw new Error("O Supabase retornou uma resposta inválida."); }
}
