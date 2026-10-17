// Whole-term matching avoids false positives such as Java inside JavaScript.
export const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
const vocabulary: Record<string, string[]> = {
  "React Native": ["react native", "react-native"], React: ["react", "reactjs", "react.js"],
  "Next.js": ["next.js", "nextjs", "next js"], "Node.js": ["node.js", "nodejs", "node js", "node"],
  TypeScript: ["typescript", "ts"], JavaScript: ["javascript", "js", "ecmascript"], Java: ["java"],
  "Spring Boot": ["spring boot", "springboot"], "Spring": ["spring"], "NestJS": ["nestjs", "nest.js", "nest"],
  PostgreSQL: ["postgresql", "postgres", "postgre"], MongoDB: ["mongodb", "mongo"], MySQL: ["mysql"],
  SQL: ["sql"], Redis: ["redis"], Docker: ["docker"], Kubernetes: ["kubernetes", "k8s"], AWS: ["aws", "amazon web services"],
  Azure: ["azure"], GCP: ["gcp", "google cloud"], Supabase: ["supabase"], Git: ["git"], GitHub: ["github"],
  Python: ["python"], Django: ["django"], Flask: ["flask"], FastAPI: ["fastapi"], Go: ["golang", "go"],
  PHP: ["php"], Laravel: ["laravel"], Angular: ["angular"], Vue: ["vue", "vuejs", "vue.js"], Svelte: ["svelte"],
  HTML: ["html", "html5"], CSS: ["css", "css3"], Tailwind: ["tailwind", "tailwindcss", "tailwind css"],
  "C#": ["c#", "csharp"], "C++": ["c++", "cpp"], ".NET": [".net", "dotnet"], Kotlin: ["kotlin"], Swift: ["swift"],
  Flutter: ["flutter"], Dart: ["dart"], Expo: ["expo"], Express: ["express", "expressjs"],
  REST: ["rest", "restful"], GraphQL: ["graphql"], "CI/CD": ["ci/cd", "ci cd", "integracao continua"],
  Jest: ["jest"], Cypress: ["cypress"], Playwright: ["playwright"], TDD: ["tdd"], Figma: ["figma"],
  Agile: ["agile", "agil", "scrum", "kanban"], "Inglês": ["ingles", "english"],
  "Acessibilidade": ["acessibilidade", "accessibility", "wcag"], "Testes": ["testes", "testing", "tests"],
};
const stopwords = new Set(normalize("para como sobre mais menos voce deve sera ser ter com dos das nos nas uma uns umas que por aos seu sua meus minhas nosso nossa temos todo toda todos todas vaga cargo empresa profissional candidato desejavel desejaveis obrigatorio obrigatorios requisitos requisito responsabilidades responsabilidade experiencia experiencias conhecimento conhecimentos dominio habilidade habilidades desenvolvimento desenvolvedor desenvolvedora developer software trabalhar trabalho atuacao utilizando uso usar anos ano years year nivel senior junior pleno capacidade familiaridade boa boas bom bons buscamos precisa necessario necessaria necessario preferencial diferencial diferenciais responsavel possuir solido solidos pratica praticas seguintes minimo minima descricao tecnologia tecnologias ferramentas ferramenta local modelo contrato beneficios salario remoto hibrido presencial the and with for from experience knowledge required requirements preferred have will you your role job years strong using working able must are our skills about this that or em de do da no na um e a o os as to in is at an of on").split(" "));
function escape(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
export function termMatches(text: string, term: string): boolean {
  const body = normalize(text);
  return (vocabulary[term] ?? [term]).some(alias => new RegExp(`(^|[^a-z0-9+#])${escape(normalize(alias))}(?=$|[^a-z0-9+#])`).test(body));
}
export function extractKeywords(text: string): string[] {
  let rest = normalize(text); const terms: string[] = [];
  for (const [term, aliases] of Object.entries(vocabulary)) {
    if (termMatches(text, term)) { terms.push(term); for (const alias of aliases) rest = rest.replace(new RegExp(`(^|[^a-z0-9+#])${escape(normalize(alias))}(?=$|[^a-z0-9+#])`, "g"), "$1 "); }
  }
  const years = normalize(text).match(/\b\d+\s*(?:anos?|years?)\b/g) ?? [];
  for (const value of years) { terms.push(value); rest = rest.replace(value, " "); }
  for (const word of rest.match(/[a-z][a-z0-9+#.-]*/g) ?? []) {
    if (word.length >= 4 && !stopwords.has(word) && !/^https?/.test(word)) terms.push(word.replace(/[.-]+$/, ""));
  }
  return [...new Set(terms)].filter(Boolean).slice(0, 80);
}

// Discovery compares technologies rather than arbitrary words from job descriptions.
export function canonicalSkill(value: string): string {
  const normalized = normalize(value);
  return Object.entries(vocabulary).find(([term, aliases]) => normalize(term) === normalized || aliases.some(alias => normalize(alias) === normalized))?.[0] ?? value.trim();
}
export function technologyKeywords(text: string): string[] {
  const excluded = new Set(["Agile", "Inglês", "Testes"]);
  return Object.keys(vocabulary).filter(term => !excluded.has(term) && termMatches(term === "React" ? text.replace(/react[ -]native/gi, "") : term === "Spring" ? text.replace(/spring[ -]?boot/gi, "") : text, term));
}
