begin;

alter table public.item_submissions
  add column if not exists collector_name text default null,
  add column if not exists collector_phone text default null;

grant select on public.item_submissions to authenticated;

commit;
