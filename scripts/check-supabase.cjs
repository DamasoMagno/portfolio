const { load, root } = require('./lib/load-typescript.cjs');
require('@next/env').loadEnvConfig(root, true, { info() {}, error() {} });
process.env.PORTFOLIO_STORAGE = 'supabase';
(async () => {
  const { readContent } = load('src/modules/content/repositories/content-repository.ts');
  const { readPosts } = load('src/modules/posts/repositories/posts-repository.ts');
  const { readEvents } = load('src/modules/analytics/repositories/analytics-repository.ts');
  await Promise.all([readContent(), readPosts(), readEvents()]);
  console.log('Conexão, tabelas, funções e dados do Supabase validados. Nenhuma gravação realizada.');
})().catch(() => { console.error('Não foi possível validar o Supabase. Confira SUPABASE_URL, a chave secreta e a migração SQL.'); process.exitCode = 1; });
