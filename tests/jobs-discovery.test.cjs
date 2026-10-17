const assert = require('node:assert/strict');
const { test } = require('node:test');
const { load } = require('../scripts/lib/load-typescript.cjs');
const { jobsDocumentSchema, emptyJobs } = load('src/modules/jobs/schemas/job.ts');
const { emptyDiscovery, opportunitySchema } = load('src/modules/jobs/schemas/discovery.ts');
const matching = load('src/modules/jobs/services/discovery-matching.ts');
const now = new Date();
const groups = [{ id: 'frontend', title: 'Frontend', tags: ['React', 'TypeScript'], published: true }, { id: 'backend', title: 'Backend', tags: ['Java'], published: false }];
const listing = (data = {}) => opportunitySchema.parse({ id: 'remotive:1', source: 'remotive', externalId: '1', company: 'Acme', title: 'Frontend Developer', url: 'https://remotive.com/remote-jobs/software-dev/frontend-1', location: 'Worldwide', remote: true, description: 'React, TypeScript e Python.', tags: [], contract: '', salary: '', publishedAt: now.toISOString(), fetchedAt: now.toISOString(), ...data });
function fixture(providerFactory) {
 let state = emptyJobs(); state.discovery.settings.sources = ['remotive', 'arbeitnow']; const calls = [];
 const repository = { read: async () => structuredClone(state), mutate: async (revision, change) => { if (revision !== state.revision) throw new (load('src/modules/jobs/repositories/errors.ts').JobsConflict)(); const next = structuredClone(state); change(next); next.revision++; state = jobsDocumentSchema.parse(next); return structuredClone(state); } };
 // Error class identity is shared between the service and fake repository.
 const errors = load('src/modules/jobs/repositories/errors.ts');
 repository.mutate = async (revision, change) => { if (revision !== state.revision) throw new errors.JobsConflict(); const next = structuredClone(state); change(next); next.revision++; state = jobsDocumentSchema.parse(next); return structuredClone(state); };
 const content = { skills: structuredClone(groups) };
 const providers = providerFactory ? providerFactory(calls) : ['remotive', 'arbeitnow'].map(source => ({ source, fetchJobs: async () => { calls.push(source); return [listing(source === 'remotive' ? {} : { source, id: 'arbeitnow:2', externalId: '2', company: 'Outra', url: 'https://www.arbeitnow.com/view/2' })]; } }));
 const service = load('src/modules/jobs/services/discovery.ts', { '../repositories/jobs-repository': { getJobsRepository: () => repository }, '../repositories/errors': errors, '@/modules/content/services/content': { getBackofficeContent: async () => content }, '../providers/job-feed-providers': { getJobFeedProviders: () => providers } });
 return { service, repository, calls, content, get state() { return state; } };
}
test('documentos antigos recebem descoberta sem perder vagas ou revisão', () => {
 const parsed = jobsDocumentSchema.parse({ version: 1, revision: 7, jobs: [] }); assert.equal(parsed.revision, 7); assert.equal(parsed.discovery.settings.automatic, true); assert.deepEqual(parsed.jobs, []);
});
test('matching usa apenas stacks selecionadas, aliases e limites de palavra', () => {
 const state = emptyDiscovery(); state.settings.sources = ['remotive', 'arbeitnow']; state.settings.skillGroupIds = ['frontend']; state.opportunities = [listing()];
 const results = matching.matchOpportunities(state, groups, []); assert.equal(results.length, 1); assert.equal(results[0].score, 67); assert.deepEqual(results[0].matchedSkills, ['React', 'TypeScript']); assert.deepEqual(results[0].missingSkills, ['Python']);
 state.opportunities = [listing({ description: 'JavaScript', title: 'Developer' })]; assert.equal(matching.matchOpportunities(state, [groups[1]], []).length, 0);
 state.opportunities = [listing({ description: 'React Native', title: 'Mobile' })]; assert.equal(matching.matchOpportunities(state, groups, []).length, 0);
 state.opportunities = [listing({ description: 'ReactJS e TS', title: 'Frontend' })]; assert.equal(matching.matchOpportunities(state, groups, [])[0].score, 100);
});
test('descoberta exclui vagas antigas, futuras, cache vencido, fonte desativada e presencial', () => {
 const state = emptyDiscovery(); state.settings.sources = ['remotive', 'arbeitnow']; const good = listing();
 state.opportunities = [good, listing({ id: 'old', publishedAt: new Date(now.getTime() - 31 * 86400000).toISOString() }), listing({ id: 'future', publishedAt: new Date(now.getTime() + 3 * 86400000).toISOString() }), listing({ id: 'cache', fetchedAt: new Date(now.getTime() - 8 * 86400000).toISOString() }), listing({ id: 'onsite', remote: false })];
 assert.deepEqual(matching.matchOpportunities(state, groups, []).map(item => item.id), [good.id]);
 state.settings.sources = ['arbeitnow']; assert.equal(matching.matchOpportunities(state, groups, []).length, 0);
});
test('matching deduplica a mesma vaga entre fontes e exclui candidaturas já importadas', () => {
 const state = emptyDiscovery(); state.settings.sources = ['remotive', 'arbeitnow']; state.opportunities = [listing(), listing({ id: 'arbeitnow:other', externalId: 'other', source: 'arbeitnow', url: 'https://www.arbeitnow.com/view/other' })];
 assert.equal(matching.matchOpportunities(state, groups, []).length, 1);
 const saved = { data: { title: 'Outro título', company: 'Outra empresa', location: '', url: state.opportunities[0].url + '?utm_source=api' } };
 assert.equal(matching.alreadySaved(state.opportunities[0], [saved]), true);
 state.dismissedIds = state.opportunities.map(item => item.id); assert.equal(matching.matchOpportunities(state, groups, []).length, 0);
});
test('coleta manual persiste, respeita seis horas e recalcula filtros sem nova coleta', async () => {
 const f = fixture(); const first = await f.service.syncDiscoveredJobs('manual', now); assert.equal(f.calls.length, 2); assert.equal(first.data.discovery.opportunities.length, 2);
 const revision = f.state.revision; await f.service.syncDiscoveredJobs('manual', new Date(now.getTime() + 10000)); assert.equal(f.calls.length, 2); assert.equal(f.state.revision, revision);
 await f.service.updateDiscovery({ action: 'settings', revision, data: { ...f.state.discovery.settings, minScore: 100 } }); assert.equal(matching.matchOpportunities(f.state.discovery, groups, []).length, 0); assert.equal(f.calls.length, 2);
 await f.service.syncDiscoveredJobs('manual', new Date(now.getTime() + matching.DISCOVERY_INTERVAL)); assert.equal(f.calls.length, 4);
});
test('automático desligado não consulta fontes; busca manual continua disponível', async () => {
 const f = fixture(); await f.repository.mutate(0, doc => { doc.discovery.settings.automatic = false; });
 await f.service.syncDiscoveredJobs('automatic'); assert.equal(f.calls.length, 0);
 await f.service.syncDiscoveredJobs('manual'); assert.equal(f.calls.length, 2);
});
test('duas buscas simultâneas compartilham lease e preservam candidaturas criadas durante a coleta', async () => {
 let release, started; const ready = new Promise(resolve => { started = resolve; });
 const f = fixture(calls => [{ source: 'remotive', fetchJobs: async () => { calls.push('remotive'); await new Promise(resolve => { release = resolve; started(); }); return [listing()]; } }]);
 const first = f.service.syncDiscoveredJobs('manual'); await ready;
 await f.service.syncDiscoveredJobs('manual'); assert.equal(f.calls.length, 1);
 await f.repository.mutate(f.state.revision, doc => { doc.discovery.settings.minScore = 50; doc.jobs.push({ id: require('node:crypto').randomUUID(), data: load('src/modules/jobs/schemas/job.ts').jobInputSchema.parse({ company: 'Manual', title: 'Backend', requirements: ['Java'] }), createdAt: now.toISOString(), updatedAt: now.toISOString(), analyses: [] }); });
 release(); await first; assert.equal(f.state.jobs[0].data.company, 'Manual'); assert.equal(f.state.discovery.settings.minScore, 50); assert.equal(f.state.discovery.run, null);
});
test('falha parcial preserva cache da fonte com erro e permite sucesso da outra', async () => {
 const f = fixture(calls => [{ source: 'remotive', fetchJobs: async () => { calls.push('remotive'); throw new Error('PRIVATE_PROVIDER_DETAIL'); } }, { source: 'arbeitnow', fetchJobs: async () => [listing({ id: 'arbeitnow:2', externalId: '2', source: 'arbeitnow', url: 'https://www.arbeitnow.com/view/2' })] }]);
 await f.repository.mutate(0, doc => { doc.discovery.opportunities = [listing()]; });
 const result = await f.service.syncDiscoveredJobs('manual'); assert.equal(result.data.discovery.opportunities.length, 2); assert.match(result.message, /parcialmente/); assert.doesNotMatch(JSON.stringify(result), /PRIVATE_PROVIDER_DETAIL/); assert.equal(f.state.discovery.sourceStatus.remotive.lastSuccessAt, null);
});
test('importar traz origem e descrição para candidatura sem IA e não duplica nem altera o anúncio', async () => {
 const f = fixture(); await f.service.syncDiscoveredJobs('manual'); const result = await f.service.updateDiscovery({ action: 'import', revision: f.state.revision, id: 'remotive:1' });
 assert.equal(result.data.jobs.length, 1); assert.equal(result.data.jobs[0].origin.source, 'remotive'); assert.equal(result.data.jobs[0].data.description, listing().description); assert.equal(result.data.jobs[0].analyses.length, 0);
 await assert.rejects(f.service.updateDiscovery({ action: 'import', revision: f.state.revision, id: 'remotive:1' }), /já está/);
});
test('coletores validam fonte, removem HTML e descartam links inesperados sem seguir URLs do anúncio', async () => {
 const original = global.fetch; let requested;
 global.fetch = async (url, options) => { requested = String(url); assert.equal(options.redirect, 'error'); return Response.json({ jobs: [
 { id: 1, url: 'https://remotive.com/remote-jobs/test-1', title: 'React &amp; TypeScript', company_name: 'Acme', description: '<p>React &amp; TypeScript</p><script>INJECTED_SCRIPT</script>', publication_date: now.toISOString() },
 { id: 2, url: 'http://127.0.0.1/private', title: 'React', company_name: 'Bad', description: 'React' }, { broken: true },
 ] }); };
 try { const { PublicJobFeedProvider } = load('src/modules/jobs/providers/public-feeds.ts'); const jobs = await new PublicJobFeedProvider('remotive').fetchJobs(now); assert.equal(jobs.length, 1); assert.equal(jobs[0].title, 'React & TypeScript'); assert.doesNotMatch(jobs[0].description, /<|INJECTED_SCRIPT/); assert.match(requested, /^https:\/\/remotive.com\/api\//); } finally { global.fetch = original; }
});
test('API de descoberta exige sessão, mesma origem e limita corpo sem Content-Length', async () => {
 let authenticated = false, origin = true, writes = 0;
 const api = load('src/app/api/backoffice/jobs/discovery/route.ts', { '@/modules/backoffice/services/access': { hasBackofficeAccess: async () => authenticated, sameOrigin: () => origin }, '@/modules/content/services/content': { getBackofficeContent: async () => ({ skills: groups }) }, '@/modules/jobs/services/discovery': { DiscoveryError: class extends Error {}, getJobDiscovery: async () => ({ data: emptyJobs(), skills: groups }), updateDiscovery: async () => { writes++; return { data: emptyJobs() }; } } });
 const request = body => new Request('https://example.com/api/backoffice/jobs/discovery', { method: 'POST', body });
 assert.equal((await api.GET()).status, 401); assert.equal((await api.POST(request('{}'))).status, 401); authenticated = true; origin = false; assert.equal((await api.POST(request('{}'))).status, 403);
 origin = true; assert.equal((await api.POST(request('x'.repeat(20001)))).status, 413); assert.equal(writes, 0); assert.equal((await api.POST(request('{}'))).status, 200); assert.equal((await api.GET()).headers.get('cache-control'), 'no-store');
});
test('cron exige segredo forte, recusa Bearer errado e não devolve vagas ou currículo', async () => {
 const before = process.env.CRON_SECRET; let calls = 0;
 const api = load('src/app/api/cron/jobs/route.ts', { '@/modules/jobs/services/discovery': { syncDiscoveredJobs: async trigger => { calls++; assert.equal(trigger, 'automatic'); return { data: { private: true }, message: 'ok' }; } } });
 const request = value => new Request('https://example.com/api/cron/jobs', { headers: value ? { Authorization: value } : {} });
 try { delete process.env.CRON_SECRET; assert.equal((await api.GET(request())).status, 503); process.env.CRON_SECRET = 'x'.repeat(40); assert.equal((await api.GET(request())).status, 401); assert.equal((await api.GET(request('Bearer wrong'))).status, 401); assert.equal(calls, 0); const result = await api.GET(request('Bearer '+process.env.CRON_SECRET)); assert.equal(result.status, 200); assert.doesNotMatch(await result.text(), /private/); } finally { if (before === undefined) delete process.env.CRON_SECRET; else process.env.CRON_SECRET = before; }
});

test('preferências PJ/CLT, contrato indefinido com aviso e Fortaleza limitam o conjunto elegível', () => {
 const state = emptyDiscovery(); state.settings.sources = ['remotive', 'arbeitnow'];
 state.opportunities = [
  listing({ id: 'remote-pj', contract: 'PJ', description: 'React e Python' }),
  listing({ id: 'remote-clt', externalId: '2', title: 'Frontend CLT', url: 'https://remotive.com/remote-jobs/2', contract: 'CLT' }),
  listing({ id: 'hybrid-fortaleza', externalId: '3', title: 'Frontend Híbrido', url: 'https://remotive.com/remote-jobs/3', remote: false, workModel: 'hybrid', location: 'Fortaleza, CE', contract: 'PJ', description: 'React e TypeScript' }),
  listing({ id: 'onsite-fortaleza', externalId: '4', title: 'Frontend Presencial', url: 'https://remotive.com/remote-jobs/4', remote: false, workModel: 'onsite', location: 'Fortaleza, Ceará', contract: 'CLT' }),
  listing({ id: 'hybrid-sp', externalId: '5', title: 'Frontend SP', url: 'https://remotive.com/remote-jobs/5', remote: false, workModel: 'hybrid', location: 'São Paulo', description: 'React. A empresa foi fundada em Fortaleza.', contract: 'PJ' }),
  listing({ id: 'unknown', externalId: '6', title: 'Frontend sem contrato', url: 'https://remotive.com/remote-jobs/6', contract: '' }),
  listing({ id: 'unknown-location', externalId: '7', title: 'Frontend local indefinido', url: 'https://remotive.com/remote-jobs/7', remote: false, workModel: 'hybrid', location: '', contract: 'PJ' }),
 ];
 let result = matching.matchOpportunities(state, groups, []); assert.equal(result.length, 5); assert.ok(result.slice(0, 3).every(item => item.remote)); assert.deepEqual(result.find(item => item.id === 'unknown').contractTypes, []);
 state.settings.includeUnknownContract = false; result = matching.matchOpportunities(state, groups, []); assert.equal(result.length, 4); assert.ok(!result.some(item => item.id === 'unknown'));
 state.settings.remoteOnly = true; result = matching.matchOpportunities(state, groups, []); assert.equal(result.length, 2);
 state.settings.contracts = ['PJ']; assert.deepEqual(matching.matchOpportunities(state, groups, []).map(item => item.id), ['remote-pj']);
});
test('metadados brasileiros distinguem modalidade local de menções à cidade no texto e não inferem PJ de contractor', () => {
 const metadata = load('src/modules/jobs/services/listing-metadata.ts');
 const result = metadata.githubListingMetadata('[Fortaleza] Frontend na Acme', '## Local\nHíbrido, Fortaleza / CE\n## Contratação\nPJ ou CLT\n## Empresa\nEscritório em São Paulo', []);
 assert.equal(result.workModel, 'hybrid'); assert.match(result.location, /Fortaleza/); assert.equal(result.contract, 'PJ / CLT'); assert.equal(result.company, 'Acme');
 assert.deepEqual(metadata.contractTypes('contractor full_time'), []); assert.deepEqual(metadata.contractTypes('Não é CLT, apenas PJ'), ['PJ']);
 assert.equal(matching.listingIdentity({ company: 'Acme', title: '[Remoto] Full Stack Developer na Acme', location: 'Brasil' }), matching.listingIdentity({ company: 'Acme', title: '[Remoto] Full Stack Developer - Acme', location: 'Brasil' }));
});
test('fonte GitHub considera apenas issues abertas, valida URL e preserva PJ/CLT e Fortaleza', async () => {
 const original = global.fetch;
 const row = { number: 123, state: 'open', title: '[Fortaleza] React Developer na Acme', body: '## Local\nHíbrido em Fortaleza\n## Contratação\nCLT\n## Requisitos\nReact e TypeScript', labels: [{ name: 'CLT' }], html_url: 'https://github.com/frontendbr/vagas/issues/123', created_at: now.toISOString() };
 global.fetch = async url => { assert.match(String(url), /^https:\/\/api.github.com\/repos\/frontendbr\/vagas\/issues\?/); return Response.json([row, { ...row, number: 124, pull_request: {} }, { ...row, number: 125, html_url: 'https://github.com/another/repo/issues/125' }, { ...row, state: 'closed' }]); };
 try { const { GitHubJobFeedProvider } = load('src/modules/jobs/providers/github-feeds.ts'); const results = await new GitHubJobFeedProvider('frontendbr').fetchJobs(now); assert.equal(results.length, 1); assert.equal(results[0].contract, 'CLT'); assert.equal(results[0].workModel, 'hybrid'); assert.match(results[0].location, /Fortaleza/); } finally { global.fetch = original; }
});
