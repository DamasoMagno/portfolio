import { normalize } from "./keywords";
import type { Opportunity } from "../schemas/discovery";
export type ContractType = "PJ" | "CLT";
export function contractTypes(text: string): ContractType[] {
  const body = normalize(text).replace(/\b(?:nao(?:\s+(?:e|aceitamos|contratamos|oferecemos))?|sem|nem)\s+(?:contrato\s+)?(?:pj|clt)\b/g, "");
  return (["PJ", "CLT"] as const).filter(type => type === "PJ" ? /\bpj\b|\bpessoa juridica\b/.test(body) : /\bclt\b|consolidacao das leis do trabalho/.test(body));
}
export function declaredWorkModel(text: string): Opportunity["workModel"] {
  const body = normalize(text).replace(/\b(?:nao(?:\s+e)?|sem)\s+(?:trabalho\s+)?(?:presencial|remoto)\b/g, "");
  if (/\bhibrid[oa]\b|\bhybrid\b/.test(body)) return "hybrid";
  if (/\bpresencial\b|\bon[ -]?site\b|\bin[ -]office\b/.test(body)) return "onsite";
  if (/\bremot[oea]\b|\bhome[ -]office\b|\banywhere\b/.test(body)) return "remote";
  return "unknown";
}
function section(body: string, heading: RegExp): string {
  const lines = body.split(/\r?\n/), index = lines.findIndex(line => /^#{1,6}\s/.test(line) && heading.test(normalize(line.replace(/^#+\s*/, ""))));
  if (index < 0) return "";
  const end = lines.findIndex((line, position) => position > index && /^#{1,6}\s/.test(line));
  return lines.slice(index + 1, end < 0 ? undefined : end).join("\n").trim().slice(0, 1000);
}
export function githubListingMetadata(title: string, body: string, labels: string[]) {
  const local = section(body, /^(?:local(?:izacao| de trabalho)?|location|modalidade|modelo de trabalho)\b/);
  const titleLocation = title.match(/^\s*\[([^\]]+)\]/)?.[1] ?? "";
  const declared = local || titleLocation;
  const workModel = declaredWorkModel(`${declared}\n${labels.join(" ")}`);
  const regime = section(body, /^(?:contratacao|regime|contrato|tipo de contratacao)\b/);
  const contracts = contractTypes(`${labels.join(" ")}\n${regime || body}`);
  const company = title.match(/(?:\s+(?:na|no|at)\s+|\s*@\s*|\s+[-–—]\s+)([^\n]+)$/i)?.[1]?.replace(/\[|\]/g, "").trim() || "Empresa não informada";
  return { location: declared.slice(0, 300), workModel, remote: workModel === "remote", contract: contracts.length ? contracts.join(" / ") : (regime || labels.filter(label => /est[aá]gio|internship|aprendiz|volunt[aá]rio/i.test(label)).join(" ")).slice(0, 100), company };
}
