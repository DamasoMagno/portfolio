import type { PortfolioContent } from "@/modules/content/schemas/content";
export async function saveBackoffice(resource: string, input: unknown): Promise<PortfolioContent> {
  const response = await fetch(`/api/backoffice/${resource}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Não foi possível salvar.");
  return body.data;
}
export async function refreshBackoffice(): Promise<PortfolioContent> {
  const response = await fetch("/api/backoffice/content", { cache: "no-store" });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Não foi possível carregar os dados.");
  return body.data;
}
