const assert = require('node:assert/strict');
const { test } = require('node:test');
const { randomUUID } = require('node:crypto');
const { load } = require('../scripts/lib/load-typescript.cjs');
const config = load('src/modules/storage/services/config.ts');
async function environment(run) {
  const previous = { ...process.env }, original = global.fetch;
  process.env.PORTFOLIO_STORAGE = 'supabase'; process.env.SUPABASE_URL = 'https://project.supabase.co'; process.env.SUPABASE_SECRET_KEY = 'sb_secret_test'; delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  try { await run(); } finally { global.fetch = original; for (const key of Object.keys(process.env)) if (!(key in previous)) delete process.env[key]; Object.assign(process.env, previous); }
}

test('configuração aceita chave secreta/legada e bloqueia chaves públicas, URLs inseguras e fallback em produção', async () => environment(async () => {
  assert.equal(config.supabaseConfig().legacy, false);
  process.env.SUPABASE_SECRET_KEY = `header.${Buffer.from(JSON.stringify({ role: 'service_role' })).toString('base64url')}.signature`;
  assert.equal(config.supabaseConfig().legacy, true);
  process.env.SUPABASE_SECRET_KEY = 'sb_publishable_test'; assert.throws(config.supabaseConfig, /chave secreta/);
  process.env.SUPABASE_SECRET_KEY = 'sb_secret_test'; process.env.SUPABASE_URL = 'http://example.com'; assert.throws(config.supabaseConfig, /HTTPS/);
  process.env.NODE_ENV = 'production'; process.env.PORTFOLIO_STORAGE = 'local'; assert.throws(config.storageProvider, /produção/);
  delete process.env.PORTFOLIO_STORAGE; delete process.env.SUPABASE_URL; delete process.env.SUPABASE_SECRET_KEY;
  assert.equal(config.storageProvider(), 'supabase'); assert.throws(config.supabaseConfig, /Configure/);
}));

test('transporte usa chave somente no servidor, desativa cache e não expõe erro do provedor', async () => environment(async () => {
  let request;
  global.fetch = async (url, options) => { request = { url, options }; return Response.json([]); };
  const { supabaseRequest } = load('src/modules/storage/services/supabase.ts');
  assert.deepEqual(await supabaseRequest('portfolio_documents'), []);
  assert.equal(request.options.cache, 'no-store'); assert.equal(request.options.headers.apikey, 'sb_secret_test'); assert.equal(request.options.headers.Authorization, undefined);
  global.fetch = async () => Response.json({ secret: 'PRIVATE_PROVIDER_DETAILS' }, { status: 401 });
  await assert.rejects(supabaseRequest('portfolio_documents'), error => !error.message.includes('PRIVATE_PROVIDER_DETAILS') && error.message.includes('401'));
}));

function mockDatabase() {
  const docs = new Map(); let fail = false;
  global.fetch = async (url, options) => {
    if (fail) return Response.json({}, { status: 503 });
    const parsed = new URL(url);
    if (parsed.pathname.endsWith('/portfolio_documents')) { const kind = parsed.searchParams.get('kind').slice(3), row = docs.get(kind); return Response.json(row ? [{ body: row, revision: row.revision }] : []); }
    if (parsed.pathname.endsWith('/portfolio_save_document')) {
      const { p_kind: kind, p_expected_revision: revision, p_body: body } = JSON.parse(options.body);
      const existing = docs.get(kind);
      if ((existing?.revision ?? 0) !== revision || body.revision !== revision + 1) return Response.json(false);
      docs.set(kind, structuredClone(body)); return Response.json(true);
    }
    throw new Error('Unexpected resource');
  };
  return { docs, setFail: () => { fail = true; } };
}

test('Supabase mantém mensagens concorrentes e rejeita revisão antiga sem gravar no disco local', async () => environment(async () => {
  const db = mockDatabase();
  const cache = new Map(), repo = load('src/modules/content/repositories/content-repository.ts', {}, cache), messages = load('src/modules/messages/services/messages.ts', {}, cache);
  assert.equal((await repo.readContent()).revision, 0); assert.equal(db.docs.size, 0);
  await Promise.all(Array.from({ length: 4 }, (_, index) => messages.recordMessage({ name: `Pessoa ${index}`, email: `p${index}@example.com`, message: 'Teste', projectType: 'api' })));
  let content = await repo.readContent(); assert.equal(content.messages.length, 4); assert.equal(content.revision, 4); assert.ok(content.messages.every(message => message.delivery === 'backoffice'));
  await assert.rejects(repo.mutateContent(data => { data.profile.name = 'Obsoleto'; }, 0), repo.RevisionConflict);
  assert.notEqual((await repo.readContent()).profile.name, 'Obsoleto');
  db.setFail(); await assert.rejects(messages.recordMessage({ name: 'Falha', email: 'f@example.com', message: 'Teste' }), /503/);
  assert.equal(db.docs.get('content').messages.length, 4);
}));

test('posts no Supabase preservam publicação e configuração e recusam atualizações concorrentes', async () => environment(async () => {
  mockDatabase(); const repo = load('src/modules/posts/repositories/posts-repository.ts');
  const initial = await repo.readPosts(); assert.equal(initial.enabled, false);
  const post = { id: randomUUID(), title: 'Artigo', slug: 'artigo', excerpt: 'Resumo', body: 'Conteúdo', cover: '', tags: [], published: false, publishedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  await repo.mutatePosts(0, data => { data.posts.push(post); });
  assert.equal((await repo.readPosts()).posts[0].body, 'Conteúdo');
  await assert.rejects(repo.mutatePosts(0, data => { data.enabled = true; }), repo.PostsConflict);
  await repo.mutatePosts(1, data => { data.enabled = true; }); assert.equal((await repo.readPosts()).enabled, true);
}));

test('analytics lê além de 1000 eventos via RPC e grava sem permitir timestamp fornecido pelo visitante', async () => environment(async () => {
  const payload = { id: randomUUID(), session: randomUUID(), path: '/', source: 'direto', device: 'desktop', type: 'pageview' }, now = Date.now(); let recorded;
  global.fetch = async (url, options) => url.endsWith('portfolio_read_events') ? Response.json(Array.from({ length: 1005 }, () => ({ payload, createdAt: new Date(now - 1000).toISOString() }))) : (recorded = JSON.parse(options.body), Response.json(true));
  const repo = load('src/modules/analytics/repositories/analytics-repository.ts');
  assert.equal((await repo.readEvents(now)).length, 1005);
  await repo.recordEvent(payload); assert.deepEqual(recorded, { p_payload: payload });
  await assert.rejects(repo.recordEvent({ ...payload, createdAt: new Date().toISOString() }));
}));

test('RPC sem corpo confirma a persistência sem erro de parsing', async () => environment(async () => {
  global.fetch = async () => new Response(null, { status: 204 });
  const { supabaseRequest } = load('src/modules/storage/services/supabase.ts');
  assert.equal(await supabaseRequest('rpc/portfolio_import', { method: 'POST', body: {} }), undefined);
}));

test('API pública de conteúdo omite mensagens e rascunhos', async () => {
  const content = load('src/modules/content/repositories/seed.ts').initialContent();
  content.projects[0].published = false;
  content.messages.push({ id: randomUUID(), name: 'Contato privado', email: 'private@example.com', message: 'Privado', projectType: 'outro', status: 'new', delivery: 'backoffice', createdAt: new Date().toISOString() });
  const service = load('src/modules/content/services/content.ts', { '../repositories/content-repository': { readContent: async () => content } });
  const route = load('src/app/api/portfolio/route.ts', { '@/modules/content/services/content': service });
  const response = await route.GET(); const { data } = await response.json();
  assert.equal(response.status, 200); assert.equal(Object.hasOwn(data, 'messages'), false);
  assert.equal(data.projects.some(project => project.id === content.projects[0].id), false);
  assert.equal(JSON.stringify(data).includes('private@example.com'), false);
});
