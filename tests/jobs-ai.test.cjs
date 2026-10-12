const { test } = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('../scripts/lib/load-typescript.cjs');
const { jobInputSchema } = load('src/modules/jobs/schemas/job.ts');
const { OpenAIJobAnalysisProvider } = load('src/modules/jobs/services/ai-analysis.ts');
const job = jobInputSchema.parse({ company: 'Teste', title: 'Frontend', requirements: ['React'] });
const advice = { summary: 'Perfil com React.', strengths: [{ text: 'React no perfil', sourceIds: ['profile'] }], gaps: ['Confirmar inglês'], suggestions: ['Detalhar entregas'] };
const sources = [{ id: 'profile', label: 'Perfil', text: 'Desenvolvedor React' }];
const response = data => Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(data) }] }] });
async function withProvider(fetcher, run) {
 const original = global.fetch, key = process.env.OPENAI_API_KEY;
 process.env.OPENAI_API_KEY = 'test-server-secret'; global.fetch = fetcher;
 try { await run(new OpenAIJobAnalysisProvider()); } finally { global.fetch = original; if (key === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = key; }
}
test('IA envia somente contexto explícito, usa resposta estruturada e valida referências', async () => withProvider(async (url, options) => {
 assert.equal(url, 'https://api.openai.com/v1/responses');
 const body = JSON.parse(options.body); assert.equal(body.store, false); assert.equal(body.text.format.strict, true);
 assert.equal(options.headers.Authorization, 'Bearer test-server-secret');
 assert.doesNotMatch(body.input, /test-server-secret/);
 return response(advice);
}, async provider => {
 const result = await provider.analyze(job, sources); assert.equal(result.strengths[0].sourceIds[0], 'profile'); assert.equal(result.truncated, false); assert.equal(result.sources[0].text, sources[0].text);
}));
test('IA rejeita fonte inventada, resposta incompleta, recusa e JSON inválido', async () => {
 for (const output of [response({ ...advice, strengths: [{ text: 'Inventado', sourceIds: ['unknown'] }] }), Response.json({ status: 'incomplete' }), Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'refusal', refusal: 'no' }] }] }), response({ summary: 'invalid' })]) {
  await withProvider(async () => output, async provider => { await assert.rejects(provider.analyze(job, sources), /validada/); });
 }
});
test('IA limita contexto e preserva indicação de truncamento', async () => withProvider(async (url, options) => {
 const input = JSON.parse(JSON.parse(options.body).input);
 assert.ok(input.sources.reduce((n, source) => n + source.text.length, 0) <= 60000);
 assert.ok(input.sources.every(source => source.text.length <= 12000)); assert.equal(input.truncated, true);
 return response(advice);
}, async provider => {
 const result = await provider.analyze(job, [...sources, ...Array.from({ length: 10 }, (_, n) => ({ id: 'post:' + n, label: 'Post', text: 'x'.repeat(20000) }))]); assert.equal(result.truncated, true);
}));
test('falhas do provedor não expõem segredo e quota tem mensagem controlada', async () => {
 for (const status of [401, 403, 429, 500]) await withProvider(async () => new Response('test-server-secret', { status }), async provider => {
  await assert.rejects(provider.analyze(job, sources), error => !error.message.includes('test-server-secret') && (status !== 429 || /quota/.test(error.message)));
 });
});
