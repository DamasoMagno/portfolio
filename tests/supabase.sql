do $$
begin
  if has_table_privilege('anon', 'public.portfolio_documents', 'SELECT') or has_table_privilege('authenticated', 'public.portfolio_documents', 'SELECT') then raise exception 'Private documents exposed'; end if;
  if has_function_privilege('anon', 'public.portfolio_save_document(text,bigint,jsonb)', 'EXECUTE') or has_function_privilege('authenticated', 'public.portfolio_import(jsonb,jsonb,jsonb)', 'EXECUTE') then raise exception 'Public writes exposed'; end if;
  if not has_table_privilege('service_role', 'public.portfolio_documents', 'SELECT,INSERT,UPDATE') then raise exception 'Server grants missing'; end if;
end;
$$;
set role service_role;
do $$
begin
  if not public.portfolio_save_document('content', 0, '{"version":1,"revision":1}') then raise exception 'Initial insert failed'; end if;
  if public.portfolio_save_document('content', 0, '{"version":1,"revision":1}') then raise exception 'Concurrent insert overwrote data'; end if;
  if not public.portfolio_save_document('content', 1, '{"version":1,"revision":2}') then raise exception 'Revision update failed'; end if;
  if public.portfolio_save_document('content', 1, '{"version":1,"revision":2}') then raise exception 'Stale revision accepted'; end if;
  if not public.portfolio_record_event('{"id":"00000000-0000-4000-8000-000000000001"}') then raise exception 'Event insert failed'; end if;
  if public.portfolio_record_event('{"id":"00000000-0000-4000-8000-000000000001"}') then raise exception 'Event duplicated'; end if;
  begin
    perform public.portfolio_import('{"version":1,"revision":1}', '{"version":1,"revision":1}', '[]');
    raise exception 'Import overwrote database';
  exception when raise_exception then
    if sqlerrm not like '%already contains data%' then raise; end if;
  end;
end;
$$;
reset role;
update public.portfolio_analytics_events set created_at = now() - interval '91 days';
select public.portfolio_record_event('{"id":"00000000-0000-4000-8000-000000000002"}');
do $$ begin if jsonb_array_length(public.portfolio_read_events()) <> 1 then raise exception 'Retention failed'; end if; end $$;
insert into public.portfolio_analytics_events(id,payload)
select md5(g::text)::uuid,jsonb_build_object('id',md5(g::text)::uuid) from generate_series(1,50001) g;
select public.portfolio_record_event('{"id":"00000000-0000-4000-8000-000000000003"}');
do $$ begin if (select count(*) from public.portfolio_analytics_events) <> 50000 then raise exception 'Event cap failed'; end if; end $$;
truncate public.portfolio_documents, public.portfolio_analytics_events;
do $$
begin
  begin
    perform public.portfolio_import('{"version":1,"revision":1}', '{"version":1,"revision":1}', jsonb_build_array(jsonb_build_object('payload', jsonb_build_object('id','00000000-0000-4000-8000-000000000004'),'createdAt',now()), jsonb_build_object('payload',jsonb_build_object('id','00000000-0000-4000-8000-000000000004'),'createdAt',now())));
    raise exception 'Duplicate import accepted';
  exception when unique_violation then null;
  end;
  if exists(select 1 from public.portfolio_documents) then raise exception 'Partial import remained'; end if;
  perform public.portfolio_import('{"version":1,"revision":1}', '{"version":1,"revision":1}', '[]');
  if (select count(*) from public.portfolio_documents) <> 2 then raise exception 'Import failed'; end if;
end;
$$;
