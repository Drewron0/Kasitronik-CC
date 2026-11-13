begin;

-- Add rating columns to item_submissions
alter table public.item_submissions
  add column if not exists collector_rating integer check (collector_rating between 1 and 5),
  add column if not exists collector_review text default '' check (length(collector_review) <= 1000),
  add column if not exists rated_at timestamptz default null;

-- Grant updates on collector info, rating, and status to authenticated
grant update (status, collector_name, collector_phone, collector_rating, collector_review, rated_at) on public.item_submissions to authenticated;

-- Allow owners to update their own submissions (supports debug transitions and rating submissions)
drop policy if exists "Cancel own pending submissions" on public.item_submissions;
drop policy if exists "Update own submissions" on public.item_submissions;

create policy "Update own submissions" on public.item_submissions
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

commit;
