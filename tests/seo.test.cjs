const assert = require('node:assert/strict');
const { test } = require('node:test');
const { load } = require('../scripts/lib/load-typescript.cjs');
const site = load('src/lib/site.ts');
const { initialContent } = load('src/modules/content/repositories/seed.ts');
async function env(values, run) { const old = { ...process.env }; Object.assign(process.env, values); try { await run(); } finally { for (const key of Object.keys(process.env)) if (!(key in old)) delete process.env[key]; Object.assign(process.env, old); } }
test('canonical aceita somente origem e bloqueia domínio local ou HTTP na produção Vercel', async () => env({ NEXT_PUBLIC_SITE_URL: 'https://portfolio.example/', VERCEL_ENV: 'production' }, () => {
 assert.equal(site.getSiteUrl(), 'https://portfolio.example');
 for (const value of ['http://localhost:3000', 'http://portfolio.example', 'https://portfolio.example/blog', 'https://user:pass@portfolio.example', 'https://portfolio.example/?x=1']) { process.env.NEXT_PUBLIC_SITE_URL = value; assert.throws(site.getSiteUrl); }
}));
test('preview é bloqueado e robots não permite backoffice na versão pública', async () => env({ NEXT_PUBLIC_SITE_URL: 'https://portfolio.example', VERCEL_ENV: 'preview' }, () => {
 const robots = load('src/app/robots.ts').default;
 assert.equal(robots().rules.disallow, '/');
 process.env.VERCEL_ENV = 'production'; assert.ok(robots().rules.disallow.includes('/backoffice')); assert.equal(robots().sitemap, 'https://portfolio.example/sitemap.xml');
}));
test('dados estruturados e snippets refletem perfil e stacks públicas, sem texto fixo de tecnologias', () => {
 const profile = initialContent().profile; profile.name = 'Nome alterado';
 const graph = site.personJsonLd('https://portfolio.example', profile, [{ id: 'a', title: 'Frontend', tags: ['React'], published: true }])['@graph'];
 assert.equal(graph[0].name, 'Nome alterado'); assert.deepEqual(graph[0].knowsAbout, ['React']);
 assert.equal(graph[1].publisher['@id'], graph[0]['@id']);
 assert.equal(site.seoText('**Perfil**\n[React](https://example.com)'), 'Perfil React'); assert.ok(site.seoText('palavra '.repeat(100)).length <= 180);
});
test('sitemap usa datas persistidas e nunca inclui admin ou blog desabilitado', async () => env({ NEXT_PUBLIC_SITE_URL: 'https://portfolio.example' }, async () => {
 const content = initialContent(); content.updatedAt = '2026-01-01T00:00:00.000Z';
 const blog = { enabled: false, posts: [] };
 const sitemap = load('src/app/sitemap.ts', { '@/modules/content/services/content': { getBackofficeContent: async () => content }, '@/modules/posts/services/posts': { publicPosts: async () => blog } }).default;
 const first = await sitemap(), second = await sitemap(); assert.deepEqual(first, second); assert.equal(first.length, 1); assert.equal(first[0].lastModified.toISOString(), content.updatedAt);
 blog.enabled = true; blog.posts = [{ slug: 'post-publico', updatedAt: '2026-02-01T00:00:00.000Z' }];
 const entries = await sitemap(); assert.equal(entries.length, 3); assert.ok(entries.every(entry => !entry.url.includes('backoffice'))); assert.equal(entries.find(entry => entry.url === 'https://portfolio.example').lastModified.toISOString(), blog.posts[0].updatedAt);
}));
