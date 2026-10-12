begin;

-- Only the Next.js server accesses these tables. No browser role can read inbox/drafts.
create table if not exists public.portfolio_documents (
  kind text primary key check (kind in ('content', 'posts')),
  revision bigint not null check (revision >= 1),
  body jsonb not null check (coalesce(jsonb_typeof(body) = 'object' and body ->> 'version' = '1' and (body ->> 'revision')::bigint = revision, false)),
  updated_at timestamptz not null default now()
);
create table if not exists public.portfolio_analytics_events (
  id uuid primary key,
  payload jsonb not null check (coalesce(jsonb_typeof(payload) = 'object' and payload ->> 'id' = id::text, false)),
  created_at timestamptz not null default now()
);
create index if not exists portfolio_analytics_created_at_idx on public.portfolio_analytics_events(created_at, id);
alter table public.portfolio_documents enable row level security;
alter table public.portfolio_analytics_events enable row level security;
revoke all on public.portfolio_documents, public.portfolio_analytics_events from public, anon, authenticated;
grant select, insert, update on public.portfolio_documents to service_role;
grant select, insert, delete on public.portfolio_analytics_events to service_role;

create or replace function public.portfolio_save_document(p_kind text, p_expected_revision bigint, p_body jsonb)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare affected integer;
begin
  if p_kind not in ('content', 'posts') or p_expected_revision is null or p_expected_revision < 0
     or jsonb_typeof(p_body) is distinct from 'object'
     or p_body ->> 'version' is distinct from '1'
     or (p_body ->> 'revision')::bigint is distinct from p_expected_revision + 1 then
    raise exception 'Invalid portfolio document';
  end if;
  if p_expected_revision = 0 then
    insert into public.portfolio_documents(kind, revision, body) values(p_kind, 1, p_body)
      on conflict(kind) do nothing;
    get diagnostics affected = row_count;
    return affected = 1;
  end if;
  update public.portfolio_documents set revision = p_expected_revision + 1, body = p_body, updated_at = now()
    where kind = p_kind and revision = p_expected_revision;
  get diagnostics affected = row_count;
  return affected = 1;
end;
$$;

create or replace function public.portfolio_record_event(p_payload jsonb)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare affected integer;
begin
  -- Serialize retention/deduplication across Node instances as well as individual requests.
  perform pg_catalog.pg_advisory_xact_lock(713021012);
  insert into public.portfolio_analytics_events(id, payload) values((p_payload ->> 'id')::uuid, p_payload)
    on conflict(id) do nothing;
  get diagnostics affected = row_count;
  delete from public.portfolio_analytics_events where created_at < now() - interval '90 days';
  delete from public.portfolio_analytics_events where id in (
    select id from public.portfolio_analytics_events order by created_at desc, id desc offset 50000
  );
  return affected = 1;
end;
$$;

-- A JSON result avoids the REST API's default 1,000-row cap when reporting analytics.
create or replace function public.portfolio_read_events()
returns jsonb language sql stable security invoker set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('payload', e.payload, 'createdAt', e.created_at) order by e.created_at, e.id), '[]'::jsonb)
  from (select id, payload, created_at from public.portfolio_analytics_events
    where created_at >= now() - interval '90 days' and created_at <= now()
    order by created_at desc, id desc limit 50000) e;
$$;

-- Migration tool imports the existing history in one transaction; it refuses overwrites.
create or replace function public.portfolio_import(p_content jsonb, p_posts jsonb, p_events jsonb)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  lock table public.portfolio_documents, public.portfolio_analytics_events in exclusive mode;
  if exists(select 1 from public.portfolio_documents) or exists(select 1 from public.portfolio_analytics_events) then
    raise exception 'Portfolio database already contains data; import refused';
  end if;
  if p_content ->> 'revision' is distinct from '1' or p_posts ->> 'revision' is distinct from '1' or jsonb_typeof(p_events) is distinct from 'array' then
    raise exception 'Invalid portfolio import';
  end if;
  insert into public.portfolio_documents(kind, revision, body) values('content', 1, p_content), ('posts', 1, p_posts);
  insert into public.portfolio_analytics_events(id, payload, created_at)
    select (event -> 'payload' ->> 'id')::uuid, event -> 'payload', (event ->> 'createdAt')::timestamptz
    from jsonb_array_elements(p_events) event
    where (event ->> 'createdAt')::timestamptz >= now() - interval '90 days'
      and (event ->> 'createdAt')::timestamptz <= now()
    order by (event ->> 'createdAt')::timestamptz desc limit 50000;
end;
$$;

revoke execute on function public.portfolio_save_document(text, bigint, jsonb) from public, anon, authenticated;
revoke execute on function public.portfolio_record_event(jsonb) from public, anon, authenticated;
revoke execute on function public.portfolio_read_events() from public, anon, authenticated;
revoke execute on function public.portfolio_import(jsonb, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.portfolio_save_document(text, bigint, jsonb) to service_role;
grant execute on function public.portfolio_record_event(jsonb) to service_role;
grant execute on function public.portfolio_read_events() to service_role;
grant execute on function public.portfolio_import(jsonb, jsonb, jsonb) to service_role;
notify pgrst, 'reload schema';
commit;
