const { load, root } = require('./lib/load-typescript.cjs');
require('@next/env').loadEnvConfig(root, true, { info() {}, error() {} });

async function main() {
  const content = await load('src/modules/content/repositories/local-content.ts').readContent();
  const posts = await load('src/modules/posts/repositories/local-posts.ts').readPosts();
  const events = await load('src/modules/analytics/repositories/local-analytics.ts').readEvents();
  const body = {
    p_content: { ...content, revision: 1 },
    p_posts: { ...posts, revision: 1, posts: posts.posts.map(({ id, createdAt, updatedAt, ...data }) => ({ id, createdAt, updatedAt, data })) },
    p_events: events.map(({ createdAt, ...payload }) => ({ createdAt, payload })),
  };
  const summary = `${content.projects.length} projetos, ${content.messages.length} mensagens, ${posts.posts.length} posts e ${events.length} eventos`;
  if (process.argv.includes('--dry-run')) { console.log(`Dados validados para importação: ${summary}. Nenhuma gravação realizada.`); return; }
  const { supabaseRequest } = load('src/modules/storage/services/supabase.ts');
  await supabaseRequest('rpc/portfolio_import', { method: 'POST', body });
  console.log(`Importação concluída: ${summary}. Arquivos locais preservados.`);
}
main().catch(error => { console.error(error.message); console.error('Importação não concluída. Confira as credenciais e execute a migração SQL. O banco precisa estar vazio; a importação não sobrescreve dados existentes.'); process.exitCode = 1; });
