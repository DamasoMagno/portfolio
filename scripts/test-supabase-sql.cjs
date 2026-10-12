const { execFileSync } = require('node:child_process');
const { readFileSync, readdirSync } = require('node:fs');
const { randomUUID } = require('node:crypto');
const path = require('node:path');
const container = `portfolio-sql-test-${randomUUID().slice(0, 8)}`;
const docker = (args, input) => execFileSync('docker', args, { input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
(async () => {
  let started = false;
  try {
    docker(['run', '--rm', '--pull=never', '-d', '--name', container, '-e', 'POSTGRES_HOST_AUTH_METHOD=trust', 'postgres:16-alpine']); started = true;
    let ready = false;
    for (let attempt = 0; attempt < 40; attempt++) {
      try { docker(['exec', container, 'pg_isready', '-U', 'postgres']); ready = true; break; } catch { await new Promise(resolve => setTimeout(resolve, 500)); }
    }
    if (!ready) throw new Error('PostgreSQL de teste não iniciou.');
    const sql = input => docker(['exec', '-i', container, 'psql', '-U', 'postgres', '-v', 'ON_ERROR_STOP=1'], input);
    sql('create role anon; create role authenticated; create role service_role bypassrls; grant usage on schema public to service_role;');
    const migration = readdirSync(path.join(__dirname, '../supabase/migrations')).filter(name => name.endsWith('.sql')).sort().map(name => readFileSync(path.join(__dirname, '../supabase/migrations', name), 'utf8')).join('\n');
    sql(migration); sql(migration);
    sql(readFileSync(path.join(__dirname, '../tests/supabase.sql'), 'utf8'));
    console.log('PASS: SQL aplicado duas vezes, grants/RLS, revisão atômica, deduplicação, retenção, limite de eventos e importação transacional sem sobrescritas. PostgreSQL 16 isolado.');
  } catch (error) { console.error(error.stderr?.toString() || error.message); process.exitCode = 1; }
  finally { if (started) docker(['stop', container]); }
})();
