import "server-only";
import { z } from "zod";
import { supabaseRequest } from "../services/supabase";
export type DocumentKind = "content" | "posts";
const rowsSchema = z.array(z.object({ body: z.unknown(), revision: z.number().int().nonnegative() })).max(1);

export async function readDocument(kind: DocumentKind): Promise<unknown | null> {
  const rows = rowsSchema.parse(await supabaseRequest(`portfolio_documents?kind=eq.${kind}&select=body,revision&limit=1`));
  if (!rows.length) return null;
  if (!rows[0].body || typeof rows[0].body !== "object" || (rows[0].body as { revision?: unknown }).revision !== rows[0].revision) throw new Error("Documento inválido no Supabase. Os dados foram preservados.");
  return rows[0].body;
}

export async function saveDocument(kind: DocumentKind, revision: number, body: unknown): Promise<boolean> {
  return z.boolean().parse(await supabaseRequest("rpc/portfolio_save_document", { method: "POST", body: { p_kind: kind, p_expected_revision: revision, p_body: body } }));
}
