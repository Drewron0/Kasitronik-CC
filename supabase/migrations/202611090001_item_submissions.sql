begin;

create table public.item_submissions (
  id uuid primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('computers', 'phones', 'appliances', 'displays', 'components')),
  item_name text not null check (length(trim(item_name)) between 1 and 120),
  brand_model text not null default '' check (length(brand_model) <= 160),
  quantity integer not null check (quantity between 1 and 100),
  condition text not null check (condition in ('working', 'damaged', 'dead', 'dismantled')),
  notes text not null default '' check (length(notes) <= 2000),
  weight_kind text not null check (weight_kind in ('unknown', 'actual', 'estimate')),
  weight_kg numeric,
  weight_min_kg numeric,
  weight_max_kg numeric,
  photo_path text not null unique,
  status text not null default 'pending' check (status = 'pending'),
  created_at timestamptz not null default now(),
  constraint submission_photo_path check (photo_path = owner_id::text || '/' || id::text || '/photo.jpg'),
  constraint submission_weight check (
    (weight_kind = 'unknown' and weight_kg is null and weight_min_kg is null and weight_max_kg is null)
    or (weight_kind = 'actual' and weight_kg is not null and weight_kg > 0 and weight_kg <= 1000 and weight_min_kg is null and weight_max_kg is null)
    or (weight_kind = 'estimate' and weight_kg is null and weight_min_kg is not null and weight_max_kg is not null and weight_min_kg > 0 and weight_min_kg < weight_max_kg and weight_max_kg <= 1000)
  )
);
create index item_submissions_owner_created on public.item_submissions (owner_id, created_at desc);
alter table public.item_submissions enable row level security;
revoke all on public.item_submissions from anon, authenticated;
grant select, insert on public.item_submissions to authenticated;

create policy "Read own submissions" on public.item_submissions for select to authenticated
  using (owner_id = (select auth.uid()));
create policy "Submit own items" on public.item_submissions for insert to authenticated
  with check (owner_id = (select auth.uid()) and status = 'pending' and exists (
    select 1 from storage.objects where bucket_id = 'submission-photos' and name = photo_path
  ));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('submission-photos', 'submission-photos', false, 5242880, array['image/jpeg']);

create policy "Upload own submission photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'submission-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/photo[.]jpg$');
create policy "Read own submission photos" on storage.objects for select to authenticated
  using (bucket_id = 'submission-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
-- Only unfinished uploads may be removed; submitted photos stay attached to their row.
create policy "Remove own unfinished photos" on storage.objects for delete to authenticated
  using (bucket_id = 'submission-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
    and not exists (select 1 from public.item_submissions where photo_path = name));

commit;
