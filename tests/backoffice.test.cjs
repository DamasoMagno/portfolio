process.env.PORTFOLIO_STORAGE = 'local';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

function load(filename, mocks = {}, cache = new Map()) {
  filename = path.resolve(__dirname, '..', filename);
  if (cache.has(filename)) return cache.get(filename).exports;
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const module = new Module(filename); cache.set(filename, module); module.filename = filename; module.paths = Module._nodeModulePaths(path.dirname(filename));
  const original = module.require.bind(module);
  module.require = (name) => {
    if (name === 'server-only') return {};
    if (Object.hasOwn(mocks, name)) return mocks[name];
    const local = name.startsWith('@/') ? path.resolve(__dirname, '../src', name.slice(2)) : name.startsWith('.') ? path.resolve(path.dirname(filename), name) : null;
    if (local && fs.existsSync(local + '.ts')) return load(local + '.ts', mocks, cache);
    return original(name);
  };
  module._compile(compiled, filename); return module.exports;
}
const schemas = load('src/modules/content/schemas/content.ts');
const cache = new Map();
const repository = load('src/modules/content/repositories/local-content.ts', {}, cache);
const services = load('src/modules/content/services/content.ts', {}, cache);
const messages = load('src/modules/messages/services/messages.ts', {}, cache);
async function isolated(run) {
  const directory = await fsp.mkdtemp(path.join(os.tmpdir(), 'portfolio-test-'));
  const previous = process.env.PORTFOLIO_DATA_FILE;
  process.env.PORTFOLIO_DATA_FILE = path.join(directory, 'content.json');
  try { await run(); } finally { if (previous === undefined) delete process.env.PORTFOLIO_DATA_FILE; else process.env.PORTFOLIO_DATA_FILE = previous; await fsp.rm(directory, { recursive: true, force: true }); }
}
const project = { title: 'Projeto de teste', description: 'Descrição', tags: ['React'], category: ['Frontend'], workType: 'projeto_pessoal', links: { github: '', demo: 'https://example.com' }, published: false };

test('Sobre mim preserva quebras de linha e Markdown após salvar e ler o perfil', async () => isolated(async () => {
  const content = await repository.readContent();
  const about = ['**Desenvolvedor Full Stack**\nTrabalho com React.\n\n\n- Aplicações web\n- APIs\n\n[GitHub](https://github.com/DamasoMagno)'];
  await services.updateProfile({ revision: content.revision, data: { ...content.profile, about } });
  assert.deepEqual((await services.publicContent()).profile.about, about);
  assert.equal(schemas.profileSchema.safeParse({ ...content.profile, about: [' \n '] }).success, false);
}));

test('valida URLs, campos obrigatórios e dados de perfil sem permitir scripts', () => {
  assert.equal(schemas.projectSchema.safeParse(project).success, true);
  assert.equal(schemas.projectSchema.safeParse({ ...project, links: { github: 'javascript:alert(1)', demo: '' } }).success, false);
  assert.equal(schemas.projectSchema.safeParse({ ...project, title: ' ' }).success, false);
  assert.equal(schemas.projectSchema.safeParse({ ...project, category: [] }).success, false);
  const seed = load('src/modules/content/repositories/seed.ts').initialContent();
  assert.equal(schemas.profileSchema.safeParse({ ...seed.profile, avatar: '//evil.example/x' }).success, false);
  assert.equal(schemas.profileSchema.safeParse({ ...seed.profile, avatar: 'https://' }).success, false);
  assert.equal(schemas.profileSchema.safeParse({ ...seed.profile, whatsapp: '123' }).success, false);
});

test('salva, edita, publica, reordena e exclui sem perder os registros iniciais', async () => isolated(async () => {
  const initial = await repository.readContent();
  const added = await services.updateCollection('projects', { action: 'save', data: project, revision: 0 });
  assert.equal(added.projects.length, initial.projects.length + 1);
  const id = added.projects.at(-1).id;
  assert.equal((await services.publicContent()).projects.some(item => item.id === id), false);
  const published = await services.updateCollection('projects', { action: 'save', id, data: { ...project, published: true }, revision: added.revision });
  assert.equal((await services.publicContent()).projects.some(item => item.id === id), true);
  const ids = published.projects.map(item => item.id).reverse();
  const ordered = await services.updateCollection('projects', { action: 'reorder', ids, revision: published.revision });
  assert.deepEqual(ordered.projects.map(item => item.id), ids);
  await assert.rejects(services.updateCollection('projects', { action: 'reorder', ids: [id, id], revision: ordered.revision }));
  const removed = await services.updateCollection('projects', { action: 'delete', id, revision: ordered.revision });
  assert.equal(removed.projects.length, initial.projects.length);
  assert.deepEqual((await repository.readContent()).projects, removed.projects);
}));

test('rejeita revisões antigas e preserva o arquivo salvo', async () => isolated(async () => {
  const first = await services.updateCollection('skills', { action: 'save', revision: 0, data: { title: 'Teste', tags: ['TypeScript'], published: false } });
  await assert.rejects(services.updateProfile({ revision: 0, data: first.profile }), repository.RevisionConflict);
  assert.equal((await repository.readContent()).revision, 1);
}));

test('serializa gravações concorrentes sem perder mensagens', async () => isolated(async () => {
  await Promise.all([messages.recordMessage({ name: 'Pessoa A', email: 'a@example.com', message: 'Mensagem A' }, 'local'), messages.recordMessage({ name: 'Pessoa B', email: 'b@example.com', message: 'Mensagem B' }, 'local')]);
  const content = await repository.readContent();
  assert.equal(content.messages.length, 2); assert.equal(content.revision, 2);
  const updated = await messages.updateMessage({ id: content.messages[0].id, status: 'archived', revision: 2 });
  assert.equal(updated.messages[0].status, 'archived');
}));

test('arquivo corrompido produz erro sem restaurar dados por cima', async () => isolated(async () => {
  await fsp.writeFile(repository.contentPath(), '{invalid');
  await assert.rejects(repository.readContent());
  await assert.rejects(messages.recordMessage({ name: 'Teste', email: 'test@example.com', message: 'Olá' }, 'local'));
  assert.equal(await fsp.readFile(repository.contentPath(), 'utf8'), '{invalid');
}));

test('autenticação exige a conta do proprietário inclusive localmente e invalida sessões', async () => {
  const names = ['NODE_ENV', 'BACKOFFICE_LOCAL', 'BACKOFFICE_ADMIN_EMAIL', 'BACKOFFICE_PASSWORD', 'BACKOFFICE_SESSION_SECRET'];
  const previous = Object.fromEntries(names.map(name => [name, process.env[name]]));
  let token = ''; let host = '127.0.0.1:3000';
  const access = load('src/modules/backoffice/services/access.ts', { 'next/headers': { headers: () => new Headers({ host }), cookies: () => ({ get: () => token ? { value: token } : undefined, set: (_, value) => { token = value; }, delete: () => { token = ''; } }) } });
  try {
    process.env.NODE_ENV = 'development'; process.env.BACKOFFICE_LOCAL = 'true';
    assert.equal(await access.hasBackofficeAccess(), false); host = 'public.example.com'; assert.equal(await access.hasBackofficeAccess(), false);
    process.env.NODE_ENV = 'production'; host = 'localhost:3000'; assert.equal(await access.hasBackofficeAccess(), false);
    process.env.BACKOFFICE_ADMIN_EMAIL = 'owner@example.com'; process.env.BACKOFFICE_PASSWORD = 'test-password'; process.env.BACKOFFICE_SESSION_SECRET = 'long-test-secret-with-at-least-32-characters';
    assert.equal(access.credentialsMatch('owner@example.com', 'wrong'), false);
    assert.equal(access.credentialsMatch('other@example.com', 'test-password'), false);
    assert.equal(access.credentialsMatch(' OWNER@example.com ', 'test-password'), true);
    await access.createSession(); assert.equal(await access.hasBackofficeAccess(), true);
    const validToken = token;
    process.env.BACKOFFICE_PASSWORD = 'changed-password'; assert.equal(await access.hasBackofficeAccess(), false);
    process.env.BACKOFFICE_PASSWORD = 'test-password';
    process.env.BACKOFFICE_ADMIN_EMAIL = 'other@example.com'; assert.equal(await access.hasBackofficeAccess(), false);
    process.env.BACKOFFICE_ADMIN_EMAIL = 'owner@example.com';
    const now = Date.now;
    try { Date.now = () => now() + 13 * 60 * 60 * 1000; assert.equal(await access.hasBackofficeAccess(), false); } finally { Date.now = now; }
    token = validToken + 'x'; assert.equal(await access.hasBackofficeAccess(), false);
    token = '1.invalid'; assert.equal(await access.hasBackofficeAccess(), false);
    await access.clearSession(); assert.equal(await access.hasBackofficeAccess(), false);
    assert.equal(access.sameOrigin(new Request('http://localhost:3000/api/backoffice/projects', { headers: { origin: 'https://evil.example' } })), false);
    assert.equal(access.sameOrigin(new Request('http://localhost:3000/api/backoffice/projects', { headers: { host: '127.0.0.1:3000', origin: 'http://127.0.0.1:3000' } })), true);
  } finally { for (const name of names) if (previous[name] === undefined) delete process.env[name]; else process.env[name] = previous[name]; }
});

const analyticsSchemas = load('src/modules/analytics/schemas/event.ts');
const analytics = load('src/modules/analytics/repositories/local-analytics.ts');
const reports = load('src/modules/analytics/services/report.ts');
const { randomUUID } = require('node:crypto');
const analyticsEvent = (data = {}) => ({ id: randomUUID(), session: randomUUID(), path: '/', source: 'direto', device: 'desktop', type: 'pageview', ...data });

test('analytics rejeita rotas privadas, campos pessoais, fontes inválidas e cliques sem rótulo', () => {
  assert.equal(analyticsSchemas.eventSchema.safeParse(analyticsEvent()).success, true);
  for (const data of [{ path: '/backoffice' }, { email: 'private@example.com' }, { source: 'https://example.com/private?email=x' }, { type: 'click' }, { label: 'E-mail' }, { type: 'click', label: 'private@example.com' }]) assert.equal(analyticsSchemas.eventSchema.safeParse(analyticsEvent(data)).success, false);
});

test('analytics persiste eventos concorrentes, deduplica e descarta histórico antigo sem alterar conteúdo', async () => {
  const directory = await fsp.mkdtemp(path.join(os.tmpdir(), 'portfolio-analytics-'));
  const previous = process.env.PORTFOLIO_ANALYTICS_FILE;
  process.env.PORTFOLIO_ANALYTICS_FILE = path.join(directory, 'analytics.json');
  try {
    assert.deepEqual(await analytics.readEvents(), []);
    const one = analyticsEvent(); const two = analyticsEvent({ type: 'click', label: 'Currículo', session: one.session });
    await Promise.all([analytics.recordEvent(one), analytics.recordEvent(two), analytics.recordEvent(one)]);
    assert.equal((await analytics.readEvents()).length, 2);
    const file = JSON.parse(await fsp.readFile(analytics.analyticsPath(), 'utf8'));
    file.events[0].createdAt = new Date(Date.now() - 91 * 86400000).toISOString();
    await fsp.writeFile(analytics.analyticsPath(), JSON.stringify(file));
    assert.equal((await analytics.readEvents()).length, 1);
    await analytics.recordEvent(analyticsEvent());
    assert.equal(JSON.parse(await fsp.readFile(analytics.analyticsPath(), 'utf8')).events.length, 2);
    await fsp.writeFile(analytics.analyticsPath(), '{invalid');
    await assert.rejects(analytics.recordEvent(analyticsEvent()));
    assert.equal(await fsp.readFile(analytics.analyticsPath(), 'utf8'), '{invalid');
  } finally {
    if (previous === undefined) delete process.env.PORTFOLIO_ANALYTICS_FILE; else process.env.PORTFOLIO_ANALYTICS_FILE = previous;
    await fsp.rm(directory, { recursive: true, force: true });
  }
});

test('relatório agrupa dias UTC e sessões sem contar cliques como visitas e atribui a primeira origem', () => {
  const now = Date.parse('2026-10-12T12:00:00Z');
  const session = randomUUID(); const otherSession = randomUUID();
  const events = [
    { ...analyticsEvent({ session, source: 'github.com' }), createdAt: '2026-10-04T12:00:00Z' },
    { ...analyticsEvent({ session }), createdAt: '2026-10-12T00:00:00Z' },
    { ...analyticsEvent({ session }), createdAt: '2026-10-12T01:00:00Z' },
    { ...analyticsEvent({ session: otherSession, device: 'mobile' }), createdAt: '2026-10-11T23:59:00Z' },
    { ...analyticsEvent({ session, type: 'click', label: 'Currículo' }), createdAt: '2026-10-12T01:00:01Z' },
  ];
  const report = reports.analyticsReport(events.reverse(), 7, now);
  assert.equal(report.views, 3); assert.equal(report.sessions, 2); assert.equal(report.clicks, 1);
  assert.equal(report.daily.length, 7); assert.equal(report.daily.at(-1).views, 2); assert.equal(report.daily.at(-2).views, 1);
  assert.deepEqual(report.actions, [{ name: 'Currículo', count: 1 }]);
  assert.ok(report.sources.some(row => row.name === 'github.com' && row.count === 1));
  assert.ok(report.devices.some(row => row.name === 'Celular' && row.count === 1));
  const empty = reports.analyticsReport([], 30, now); assert.equal(empty.sessions, 0); assert.equal(empty.daily.length, 30);
});

const postsRepository = load('src/modules/posts/repositories/local-posts.ts', {}, cache);
const postsServices = load('src/modules/posts/services/posts.ts', {}, cache);
const postsSchemas = load('src/modules/posts/schemas/post.ts');
async function isolatedPosts(run) {
  const directory = await fsp.mkdtemp(path.join(os.tmpdir(), 'portfolio-posts-'));
  const previous = process.env.PORTFOLIO_POSTS_FILE;
  process.env.PORTFOLIO_POSTS_FILE = path.join(directory, 'posts.json');
  try { await run(); } finally { if (previous === undefined) delete process.env.PORTFOLIO_POSTS_FILE; else process.env.PORTFOLIO_POSTS_FILE = previous; await fsp.rm(directory, { recursive: true, force: true }); }
}
const postData = { title: 'Meu primeiro artigo', slug: 'meu-primeiro-artigo', excerpt: 'Um resumo', body: '## Artigo\n\nConteúdo.', cover: '', tags: ['React'], published: false, publishedAt: null };

test('posts validam endereços e imagens e exigem conteúdo para publicação', () => {
  assert.equal(postsSchemas.postSlug('Arquitetura & serviços!'), 'arquitetura-servicos');
  assert.equal(postsSchemas.postInputSchema.safeParse(postData).success, true);
  for (const data of [{ slug: '../backoffice' }, { slug: 'Maiusculo' }, { cover: 'javascript:alert(1)' }, { cover: '//evil.example/image' }, { body: '', published: true }]) assert.equal(postsSchemas.postInputSchema.safeParse({ ...postData, ...data }).success, false);
});

test('posts preservam rascunhos, publicação e agendamento e escondem o blog sem excluir conteúdo', async () => isolatedPosts(async () => {
  let document = await postsRepository.readPosts(); assert.equal(document.enabled, false);
  document = await postsServices.updatePosts({ action: 'save', revision: document.revision, data: postData });
  const id = document.posts[0].id;
  assert.equal(postsServices.visiblePosts(document).length, 0);
  document = await postsServices.updatePosts({ action: 'save', id, revision: document.revision, data: { ...postData, published: true } });
  assert.ok(document.posts[0].publishedAt); assert.equal(postsServices.visiblePosts(document).length, 0);
  document = await postsServices.updatePosts({ action: 'settings', enabled: true, revision: document.revision });
  assert.equal(postsServices.visiblePosts(document).length, 1);
  await assert.rejects(postsServices.updatePosts({ action: 'save', revision: document.revision, data: postData }), /endereço/);
  const scheduledAt = new Date(Date.now() + 86400000).toISOString();
  document = await postsServices.updatePosts({ action: 'save', revision: document.revision, data: { ...postData, slug: 'agendado', published: true, publishedAt: scheduledAt } });
  assert.equal(postsServices.visiblePosts(document).length, 1);
  assert.equal(postsServices.visiblePosts(document, Date.parse(scheduledAt) + 1).length, 2);
  const revision = document.revision;
  document = await postsServices.updatePosts({ action: 'settings', enabled: false, revision });
  assert.equal(document.posts.length, 2); assert.equal(postsServices.visiblePosts(document).length, 0);
  await assert.rejects(postsServices.updatePosts({ action: 'delete', revision, id }), postsRepository.PostsConflict);
  const concurrent = await Promise.allSettled([postsServices.updatePosts({ action: 'settings', enabled: true, revision: document.revision }), postsServices.updatePosts({ action: 'delete', id, revision: document.revision })]);
  assert.equal(concurrent.filter(result => result.status === 'fulfilled').length, 1);
  document = await postsRepository.readPosts();
  document = await postsServices.updatePosts({ action: 'delete', id, revision: document.revision });
  assert.equal(document.posts.length, 1);
  await fsp.writeFile(postsRepository.postsPath(), '{invalid');
  await assert.rejects(postsRepository.readPosts());
  await assert.rejects(postsServices.updatePosts({ action: 'settings', enabled: false, revision: 0 }));
  assert.equal(await fsp.readFile(postsRepository.postsPath(), 'utf8'), '{invalid');
}));

test('migra serviços em arquivos antigos preservando perfil e publica somente serviços habilitados', async () => isolated(async () => {
  const original = await repository.readContent();
  original.profile.name = 'Nome editado'; delete original.services;
  await fsp.writeFile(repository.contentPath(), JSON.stringify(original));
  const migrated = await repository.readContent();
  assert.equal(migrated.profile.name, 'Nome editado'); assert.equal(migrated.services.length, 3);
  let document = await services.updateCollection('services', { action: 'save', revision: 0, data: { title: 'Serviço teste', description: 'Descrição', deliverables: ['Item'], icon: 'web', published: false } });
  const item = document.services.at(-1);
  assert.equal((await services.publicContent()).services.some(service => service.id === item.id), false);
  document = await services.updateCollection('services', { action: 'save', revision: document.revision, id: item.id, data: { ...item, published: true } });
  assert.equal((await services.publicContent()).services.some(service => service.id === item.id), true);
  assert.equal((await repository.readContent()).profile.name, 'Nome editado');
}));

test('projetos antigos recebem campos de apresentação opcionais e capas rejeitam scripts', () => {
  const parsed = schemas.projectSchema.parse(project);
  assert.equal(parsed.cover, ''); assert.equal(parsed.context, ''); assert.equal(parsed.contribution, ''); assert.equal(parsed.outcome, '');
  assert.equal(schemas.projectSchema.safeParse({ ...project, cover: '/project-previews/activer.png' }).success, true);
  for (const cover of ['javascript:alert(1)', '//evil.example/image']) assert.equal(schemas.projectSchema.safeParse({ ...project, cover }).success, false);
  assert.equal(schemas.messageSchema.parse({ name: 'Pessoa', email: 'p@example.com', message: 'Olá' }).projectType, 'outro');
  assert.equal(schemas.messageSchema.safeParse({ name: 'Pessoa', email: 'p@example.com', message: 'Olá', projectType: 'invalid' }).success, false);
});

test('contatos confirmados são separados de cliques e a taxa considera sessões únicas com visita', () => {
  const session = randomUUID(), second = randomUUID(), now = Date.now();
  const stored = data => ({ ...analyticsEvent(data), createdAt: new Date(now).toISOString() });
  const events = [stored({ session }), stored({ session: second }), stored({ session, type: 'click', label: 'WhatsApp' }), stored({ session, type: 'click', label: 'Currículo' }), stored({ session, type: 'conversion', label: 'Mensagem recebida' }), stored({ session, type: 'conversion', label: 'Mensagem recebida' }), stored({ type: 'conversion', label: 'Mensagem recebida' })];
  const report = reports.analyticsReport(events, 7, now);
  assert.deepEqual(report.conversions, { messages: 3, whatsapp: 1, resume: 1, convertedSessions: 1, rate: 50 });
  assert.equal(report.clicks, 2); assert.equal(report.views, 2);
  assert.equal(analyticsSchemas.eventSchema.safeParse(analyticsEvent({ type: 'click', label: 'Mensagem recebida' })).success, false);
  assert.equal(analyticsSchemas.eventSchema.safeParse(analyticsEvent({ type: 'conversion', label: 'WhatsApp' })).success, false);
});

test('formulário mantém o tipo de projeto e conta conversão somente depois de salvar com sucesso', async () => {
  const saved = [], conversions = []; let fail = false;
  const api = load('src/app/api/contact/route.ts', {
    '@/modules/messages/services/messages': { recordMessage: async fields => { if (fail) throw new Error('Falha'); saved.push(fields); return { id: randomUUID() }; } },
    '@/modules/backoffice/services/access': { sameOrigin: () => true,  },
    '@/modules/analytics/services/contact-conversion': { recordContactConversion: async (_request, context) => conversions.push(context) },
  });
  const context = { session: randomUUID(), path: '/', source: 'direto', device: 'desktop' };
  const body = { name: 'Pessoa', email: 'p@example.com', message: 'Preciso de uma API', projectType: 'api', analytics: context };
  const send = data => api.POST(new Request('http://localhost/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }));
  assert.equal((await send(body)).status, 200); assert.equal(saved[0].projectType, 'api'); assert.equal(Object.hasOwn(saved[0], 'analytics'), false); assert.deepEqual(conversions, [context]);
  assert.equal((await send({ ...body, email: 'invalid' })).status, 400); assert.equal(conversions.length, 1);
  fail = true; assert.equal((await send(body)).status, 503); assert.equal(conversions.length, 1);
});
