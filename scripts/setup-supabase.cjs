const { execFileSync } = require('node:child_process');
const { readFileSync, readdirSync } = require('node:fs');
const path = require('node:path');
const { root } = require('./lib/load-typescript.cjs');
require('@next/env').loadEnvConfig(root, true, { info() {}, error() {} });
try {
  const url = new URL(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
  const reference = url.hostname.split('.')[0];
  if (!/^[a-z0-9]+$/.test(reference) || !url.hostname.endsWith('.supabase.co') || !process.env.SUPABASE_DB_PASSWORD) throw new Error('Configure a URL do projeto e SUPABASE_DB_PASSWORD.');
  const env = { ...process.env, PGHOST: process.env.SUPABASE_DB_HOST || `db.${reference}.supabase.co`, PGUSER: process.env.SUPABASE_DB_USER || 'postgres', PGPORT: process.env.SUPABASE_DB_PORT || '5432', PGDATABASE: process.env.SUPABASE_DB_NAME || 'postgres', PGPASSWORD: process.env.SUPABASE_DB_PASSWORD, PGSSLMODE: 'require', PGCONNECT_TIMEOUT: '10' };
  const sql = process.argv.includes('--check') ? 'select 1;' : readdirSync(path.join(root, 'supabase/migrations')).filter(name => name.endsWith('.sql')).sort().map(name => readFileSync(path.join(root, 'supabase/migrations', name), 'utf8')).join('\n');
  execFileSync('psql', ['-v', 'ON_ERROR_STOP=1'], { env, input: sql, stdio: ['pipe', 'pipe', 'pipe'], timeout: 60000 });
  console.log(process.argv.includes('--check') ? 'Conexão PostgreSQL do Supabase validada.' : 'Migração aplicada no Supabase.');
} catch (error) {
  // Credentials never appear in process arguments or diagnostics.
  const details = error.stderr?.toString() ?? '';
  if (/Network is unreachable|No route to host|could not translate host name|nodename nor servname|Name or service not known/i.test(details)) console.error('Conexão direta indisponível nesta rede. Configure SUPABASE_DB_HOST/USER/PORT com a conexão do pooler ou execute o SQL no SQL Editor do Supabase.');
  else if (/password authentication failed/i.test(details)) console.error('A senha do PostgreSQL foi recusada. Confira SUPABASE_DB_PASSWORD.');
  else console.error('Não foi possível aplicar/verificar o SQL. Confira a conexão PostgreSQL e a senha. Também é possível executar o arquivo no SQL Editor do Supabase.');
  process.exitCode = 1;
}
