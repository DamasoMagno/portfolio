begin;
create table if not exists public.portfolio_jobs (
  id boolean primary key default true check (id),
  revision bigint not null check (revision >= 1),
  body jsonb not null check (coalesce(jsonb_typeof(body) = 'object' and body ->> 'version' = '1' and (body ->> 'revision')::bigint = revision, false)),
  updated_at timestamptz not null default now()
);
alter table public.portfolio_jobs enable row level security;
revoke all on public.portfolio_jobs from public, anon, authenticated;
grant select, insert, update on public.portfolio_jobs to service_role;
create or replace function public.portfolio_save_jobs(p_expected_revision bigint, p_body jsonb)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare affected integer;
begin
  if p_expected_revision is null or p_expected_revision < 0 or jsonb_typeof(p_body) is distinct from 'object'
    or p_body ->> 'version' is distinct from '1' or (p_body ->> 'revision')::bigint is distinct from p_expected_revision + 1
    or jsonb_typeof(p_body -> 'jobs') is distinct from 'array' then raise exception 'Invalid jobs document'; end if;
  if p_expected_revision = 0 then
    insert into public.portfolio_jobs(id, revision, body) values(true, 1, p_body) on conflict(id) do nothing;
    get diagnostics affected = row_count; return affected = 1;
  end if;
  update public.portfolio_jobs set revision = p_expected_revision + 1, body = p_body, updated_at = now()
    where id = true and revision = p_expected_revision;
  get diagnostics affected = row_count; return affected = 1;
end;
$$;
revoke all on function public.portfolio_save_jobs(bigint, jsonb) from public, anon, authenticated;
grant execute on function public.portfolio_save_jobs(bigint, jsonb) to service_role;
commit;
