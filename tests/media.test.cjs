const assert = require('node:assert/strict');
const { test } = require('node:test');
const sharp = require('sharp');
const { load } = require('../scripts/lib/load-typescript.cjs');
const { uploadImage } = load('src/modules/media/services/images.ts');
const { readImageForm } = load('src/modules/media/services/multipart.ts');
const { MAX_IMAGE_BYTES, MAX_UPLOAD_BYTES } = load('src/modules/media/schemas/image.ts');
const file = (body, type = 'image/png') => ({ type, size: body.length, arrayBuffer: async () => body });
const png = () => sharp({ create: { width: 1600, height: 800, channels: 3, background: '#8257e6' } }).png().toBuffer();

test('upload decodifica, reduz a foto e envia WebP com chave aleatória ao repositório', async () => {
  const saved = [];
  const repository = { put: async image => { saved.push(image); return { key: image.key, url: `https://example.com/${image.key}` }; } };
  const image = await uploadImage(file(await png()), 'profile', repository);
  assert.equal(image.width, 1200); assert.equal(image.height, 600);
  assert.match(image.key, /^portfolio\/profile\/[a-f0-9-]{36}\.webp$/);
  assert.equal(saved[0].contentType, 'image/webp');
  const metadata = await sharp(saved[0].body).metadata();
  assert.equal(metadata.format, 'webp'); assert.equal(metadata.exif, undefined);
  const second = await uploadImage(file(await png()), 'projects', repository);
  assert.equal(second.width, 1600); assert.notEqual(second.key, image.key);
});

test('rejeita conteúdo falsificado, SVG, destinos e tamanhos inválidos antes de persistir', async () => {
  let writes = 0; const repository = { put: async () => { writes++; } };
  const valid = await png();
  for (const [input, purpose] of [[file(valid, 'image/jpeg'), 'posts'], [file(Buffer.from('<svg/>')), 'posts'], [file(valid), '../private'], [file(Buffer.alloc(0)), 'profile'], [{ ...file(valid), size: MAX_IMAGE_BYTES + 1 }, 'profile'], [{ ...file(valid), size: 1 }, 'profile']]) {
    await assert.rejects(uploadImage(input, purpose, repository));
  }
  assert.equal(writes, 0);
  await assert.rejects(uploadImage(file(valid), 'posts', { put: async () => { throw new Error('provider unavailable'); } }), /provider unavailable/);
});

test('multipart limita corpos sem Content-Length e aceita um formulário válido', async () => {
  const body = new FormData(); body.set('purpose', 'projects'); body.set('file', new Blob([await png()], { type: 'image/png' }), 'test.png');
  const form = await readImageForm(new Request('https://example.com/api', { method: 'POST', body }));
  assert.equal(form.get('purpose'), 'projects'); assert.equal(form.get('file').type, 'image/png');
  let cancelled = false;
  const stream = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(MAX_UPLOAD_BYTES + 1)); }, cancel() { cancelled = true; } });
  await assert.rejects(readImageForm(new Request('https://example.com/api', { method: 'POST', body: stream, duplex: 'half', headers: { 'content-type': 'multipart/form-data; boundary=test' } })), error => error.status === 413);
  assert.equal(cancelled, true);
});

test('API de imagens exige sessão e origem e não expõe erros do armazenamento', async () => {
  let authenticated = false, origin = true, reads = 0;
  const route = load('src/app/api/backoffice/images/route.ts', {
    '@/modules/backoffice/services/access': { hasBackofficeAccess: async () => authenticated, sameOrigin: () => origin },
    '@/modules/media/services/multipart': { readImageForm: async () => { reads++; const form = new FormData(); form.set('file', new Blob(['test']), 'test.png'); form.set('purpose', 'profile'); return form; } },
    '@/modules/media/services/images': { uploadImage: async () => { throw new Error('secret provider response'); } },
  });
  const request = () => new Request('https://example.com/api', { method: 'POST' });
  assert.equal((await route.POST(request())).status, 401); assert.equal(reads, 0);
  authenticated = true; origin = false;
  assert.equal((await route.POST(request())).status, 403); assert.equal(reads, 0);
  origin = true; const response = await route.POST(request());
  assert.equal(response.status, 503); assert.doesNotMatch(await response.text(), /secret provider/);
});
