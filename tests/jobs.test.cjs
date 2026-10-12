const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { load } = require('../scripts/lib/load-typescript.cjs');
const cache = new Map();
const schemas = load('src/modules/jobs/schemas/job.ts', {}, cache);
const { analyzeJob } = load('src/modules/jobs/services/analyzer.ts', {}, cache);
const { initialContent } = load('src/modules/content/repositories/seed.ts', {}, cache);
const keywords = load('src/modules/jobs/services/keywords.ts', {}, cache);
const job = (data = {}) => schemas.jobInputSchema.parse({ company: 'Empresa Teste', title: 'Frontend', requirements: ['React', 'TypeScript'], ...data });
const posts = { version: 1, revision: 4, enabled: false, posts: [] };

test('vaga valida dados, link seguro e descrição/requisitos obrigatórios', () => {
  assert.equal(job().company, 'Empresa Teste');
  assert.throws(() => job({ url: 'javascript:alert(1)' }));
  assert.throws(() => job({ requirements: [], description: '' }));
  assert.throws(() => job({ company: '' }));
  assert.throws(() => job({ requirements: Array(41).fill('React') }));
});

test('ATS compara termos completos e aliases sem confundir Java com JavaScript ou C# com C++', () => {
  assert.equal(keywords.termMatches('JavaScript e TypeScript', 'Java'), false);
  assert.equal(keywords.termMatches('React Native e React', 'React'), true);
  assert.equal(keywords.termMatches('NodeJS e postgres', 'Node.js'), true);
  assert.equal(keywords.termMatches('C#', 'C++'), false);
  assert.equal(keywords.termMatches('C++', 'C++'), true);
  assert.ok(keywords.extractKeywords('Conhecimento em Node.js e PostgreSQL').includes('PostgreSQL'));
});

test('ATS inclui rascunhos, produz evidências e não trata material recomendado como experiência', () => {
  const content = initialContent(); content.skills = [{ id: 'private-skill', title: 'Frontend', tags: ['React', 'TypeScript', 'Rust'], published: false }];
  content.recommendations.push({ id: 'material', title: 'Kubernetes', description: 'Material de Kubernetes', instructor: 'Autor', href: 'https://example.com', icon: 'book', published: false });
  const analysis = analyzeJob(job({ requirements: ['React', 'TypeScript', 'Rust', 'Kubernetes', 'Java'] }), content, posts);
  assert.ok(analysis.matchedKeywords.includes('React')); assert.ok(analysis.matchedKeywords.includes('TypeScript'));
  assert.ok(analysis.missingKeywords.includes('Kubernetes'));
  assert.ok(analysis.requirements.find(item => item.requirement === 'Kubernetes').evidence.some(item => item.sourceId === 'recommendation:material'));
  assert.ok(analysis.requirements.find(item => item.requirement === 'Rust').evidence.some(item => item.sourceId === 'skill:private-skill'));
  assert.doesNotMatch(analysis.resumeMarkdown, /Kubernetes/);
  assert.equal(analysis.postsRevision, 4);
  assert.equal(analysis.sources.recommendations, content.recommendations.length);
});

test('cobertura pondera obrigatórios, não duplica termos e mantém anos/fluência sob revisão', () => {
  const content = initialContent(); content.profile.intro = 'React'; content.profile.about = ['React']; content.profile.headline = 'React';
  content.skills = [{ id: 'a', title: 'React', tags: ['React'], published: true }]; content.projects = []; content.experiences = []; content.recommendations = []; content.services = [];
  const analysis = analyzeJob(job({ requirements: ['React', 'React'], desirable: ['Python'] }), content, posts);
  assert.equal(analysis.score, 67); // React weight 2, Python weight 1.
  const numeric = analyzeJob(job({ requirements: ['5 anos com React'] }), content, posts);
  assert.equal(numeric.requirements[0].status, 'partial'); assert.ok(numeric.missingKeywords.includes('5 anos'));
  const resume = analyzeJob(job({ requirements: ['Python'], resumeText: 'Experiência em Python.' }), content, posts);
  assert.equal(resume.score, 100); assert.equal(resume.sources.resume, 1);
});

test('análise usa dados profissionais sem mensagens/analytics e gera rascunho sem fatos inventados', () => {
  const content = initialContent(); content.messages = [{ message: 'PRIVATE_INBOX_SECRET', email: 'lead@example.com', name: 'Lead' }];
  const analysis = analyzeJob(job({ requirements: ['Rust', 'Doutorado'] }), content, posts);
  assert.ok(analysis.missingKeywords.includes('Rust') || analysis.missingKeywords.includes('rust'));
  assert.doesNotMatch(JSON.stringify(analysis), /PRIVATE_INBOX_SECRET|lead@example.com/);
  assert.doesNotMatch(analysis.resumeMarkdown, /Doutorado|\bRust\b/);
  assert.match(analysis.resumeMarkdown, /Objetivo\nFrontend · Empresa Teste/);
});

async function isolated(run) {
  const before = { ...process.env }, dir = await fs.mkdtemp(path.join(os.tmpdir(), 'portfolio-jobs-'));
  process.env.PORTFOLIO_STORAGE = 'local'; process.env.PORTFOLIO_JOBS_FILE = path.join(dir, 'jobs.json');
  try { await run(); } finally { for (const key of Object.keys(process.env)) if (!(key in before)) delete process.env[key]; Object.assign(process.env, before); await fs.rm(dir, { recursive: true, force: true }); }
}

test('repositório local mantém revisões concorrentes e recusa sobrescrever documento corrompido', async () => isolated(async () => {
  const { localJobsRepository: repository } = load('src/modules/jobs/repositories/local-jobs.ts');
  assert.equal((await repository.read()).revision, 0);
  await repository.mutate(0, () => {});
  const results = await Promise.allSettled([repository.mutate(1, () => {}), repository.mutate(1, () => {})]);
  assert.equal(results.filter(item => item.status === 'fulfilled').length, 1); assert.equal((await repository.read()).revision, 2);
  await fs.writeFile(process.env.PORTFOLIO_JOBS_FILE, '{invalid'); await assert.rejects(repository.mutate(2, () => {}));
  assert.equal(await fs.readFile(process.env.PORTFOLIO_JOBS_FILE, 'utf8'), '{invalid');
}));

test('serviço salva, edita, analisa, preserva histórico e exclui a vaga privada', async () => isolated(async () => {
  const content = initialContent();
  const service = load('src/modules/jobs/services/jobs.ts', { '@/modules/content/services/content': { getBackofficeContent: async () => content }, '@/modules/posts/services/posts': { getBackofficePosts: async () => posts } });
  let document = await service.updateJobs({ action: 'save', revision: 0, data: job() }); const id = document.jobs[0].id;
  document = await service.updateJobs({ action: 'analyze', revision: 1, id });
  assert.equal(document.jobs[0].analyses.length, 1);
  document = await service.updateJobs({ action: 'save', revision: 2, id, data: job({ title: 'Backend', requirements: ['Java'] }) });
  assert.equal(document.jobs[0].analyses.length, 1); const first = document.jobs[0].analyses[0].jobFingerprint;
  document = await service.updateJobs({ action: 'analyze', revision: 3, id });
  assert.equal(document.jobs[0].analyses.length, 2); assert.notEqual(document.jobs[0].analyses[0].jobFingerprint, first);
  for (let index = 0; index < 12; index++) document = await service.updateJobs({ action: 'analyze', revision: document.revision, id });
  assert.equal(document.jobs[0].analyses.length, 10);
  document = await service.updateJobs({ action: 'delete', revision: document.revision, id }); assert.equal(document.jobs.length, 0);
}));

test('API de vagas exige sessão, valida origem e limita upload sem Content-Length', async () => {
  let authenticated = false, origin = true, writes = 0;
  const route = load('src/app/api/backoffice/jobs/route.ts', {
    '@/modules/backoffice/services/access': { hasBackofficeAccess: async () => authenticated, sameOrigin: () => origin },
    '@/modules/jobs/services/jobs': { getBackofficeJobs: async () => schemas.emptyJobs(), updateJobs: async () => { writes++; return schemas.emptyJobs(); } },
  });
  const request = () => new Request('https://example.com/api/backoffice/jobs', { method: 'POST', body: '{}' });
  assert.equal((await route.GET()).status, 401); assert.equal((await route.POST(request())).status, 401); assert.equal(writes, 0);
  authenticated = true; origin = false; assert.equal((await route.POST(request())).status, 403);
  origin = true; const stream = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(120001)); } });
  assert.equal((await route.POST(new Request('https://example.com/api/backoffice/jobs', { method: 'POST', body: stream, duplex: 'half' }))).status, 413);
  assert.equal(writes, 0); assert.equal((await route.POST(request())).status, 200);
  assert.equal((await route.GET()).headers.get('cache-control'), 'no-store');
});

test('adaptador Supabase de vagas valida revisões e retorna conflito sem alterar dados concorrentes', async () => {
  const previous = { ...process.env }, original = global.fetch;
  process.env.SUPABASE_URL = 'https://project.supabase.co'; process.env.SUPABASE_SECRET_KEY = 'sb_secret_test'; delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  let body = null;
  global.fetch = async (input, options = {}) => {
    const url = String(input);
    assert.ok(new Headers(options.headers).get('apikey') === 'sb_secret_test');
    if (url.includes('/portfolio_jobs?')) return Response.json(body ? [{ body, revision: body.revision }] : []);
    if (url.endsWith('/rpc/portfolio_save_jobs')) {
      const payload = JSON.parse(options.body);
      if ((body?.revision ?? 0) !== payload.p_expected_revision) return Response.json(false);
      body = payload.p_body; return Response.json(true);
    }
    throw new Error('Unexpected transport');
  };
  try {
    const { SupabaseJobsRepository } = load('src/modules/jobs/repositories/supabase-jobs.ts'); const repository = new SupabaseJobsRepository();
    assert.equal((await repository.read()).revision, 0);
    const values = await Promise.allSettled([repository.mutate(0, () => {}), repository.mutate(0, () => {})]);
    assert.equal(values.filter(item => item.status === 'fulfilled').length, 1); assert.equal(body.revision, 1);
    await assert.rejects(repository.mutate(0, () => {}), /outra janela/); assert.equal(body.revision, 1);
  } finally { global.fetch = original; for (const key of Object.keys(process.env)) if (!(key in previous)) delete process.env[key]; Object.assign(process.env, previous); }
});
