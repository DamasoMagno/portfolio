const assert = require('node:assert/strict');
const { test } = require('node:test');
const { PDFDocument } = require('pdf-lib');
const { load } = require('../scripts/lib/load-typescript.cjs');
const { initialContent } = load('src/modules/content/repositories/seed.ts');
const { RevisionConflict } = load('src/modules/content/repositories/errors.ts');
async function fixture() {
 let content = initialContent(), puts = [], removed = [], conflict = false;
 const storage = { put: async value => { puts.push(value); return { key: value.key, url: 'https://example.com/' + value.key }; }, remove: async key => removed.push(key) };
 const repository = { read: async () => structuredClone(content), mutate: async (change, revision) => { if (conflict || revision !== content.revision) throw new RevisionConflict(); const next = structuredClone(content); change(next); next.revision++; content = next; return next; } };
 const service = load('src/modules/resume/services/resume.ts', { '@/modules/content/repositories/content-repository': { getContentRepository: () => repository } });
 const pdf = await PDFDocument.create(); pdf.addPage(); const bytes = Buffer.from(await pdf.save());
 const file = { type: 'application/pdf', size: bytes.length, arrayBuffer: async () => bytes };
 return { service, storage, file, puts, removed, get content() { return content; }, race() { conflict = true; } };
}
test('upload publica PDF via repository e preserva todos os outros campos do perfil', async () => {
 const f = await fixture(); const profile = f.content.profile;
 const result = await f.service.uploadResume(f.file, 0, f.storage);
 assert.deepEqual({ ...result.profile, resume: profile.resume }, profile);
 assert.equal(result.revision, 1); assert.match(result.profile.resume, /portfolio\/resumes\/.+\.pdf$/);
 assert.equal(f.puts[0].contentType, 'application/pdf'); assert.equal(f.removed.length, 0);
});
test('upload rejeita MIME falso, PDF corrompido e arquivo acima do limite sem enviar ao S3', async () => {
 const f = await fixture();
 await assert.rejects(f.service.uploadResume({ ...f.file, type: 'text/html' }, 0, f.storage), /PDF/);
 await assert.rejects(f.service.uploadResume({ ...f.file, size: 4 * 1024 * 1024 + 1 }, 0, f.storage), /4 MB/);
 const bytes = Buffer.from('%PDF-invalid');
 await assert.rejects(f.service.uploadResume({ type: 'application/pdf', size: bytes.length, arrayBuffer: async () => bytes }, 0, f.storage), /PDF/);
 assert.equal(f.puts.length, 0);
});
test('conflito de versão não publica PDF nem sobrescreve perfil; upload posterior é removido', async () => {
 const f = await fixture(); const old = f.content.profile.resume;
 await assert.rejects(f.service.uploadResume(f.file, 1, f.storage), /outra tela/); assert.equal(f.puts.length, 0);
 f.race(); await assert.rejects(f.service.uploadResume(f.file, 0, f.storage), /outra tela/);
 assert.equal(f.content.profile.resume, old); assert.equal(f.removed[0], f.puts[0].key);
});
test('API de currículo exige sessão e origem antes de ler o arquivo', async () => {
 let authenticated = false, origin = true, uploads = 0;
 const api = load('src/app/api/backoffice/resume/route.ts', { '@/modules/backoffice/services/access': { hasBackofficeAccess: async () => authenticated, sameOrigin: () => origin }, '@/modules/resume/services/resume': { uploadResume: async () => { uploads++; return initialContent(); } } });
 const request = () => new Request('https://example.com/api/backoffice/resume', { method: 'POST', body: '{}' });
 assert.equal((await api.POST(request())).status, 401); authenticated = true; origin = false;
 assert.equal((await api.POST(request())).status, 403); assert.equal(uploads, 0);
 origin = true; const form = new FormData(); form.set('file', new Blob(['fake'], { type: 'application/pdf' }), 'cv.pdf'); form.set('revision', '0');
 const result = await api.POST(new Request('https://example.com/api/backoffice/resume', { method: 'POST', body: form }));
 assert.equal(result.status, 201); assert.equal(result.headers.get('cache-control'), 'no-store');
});
