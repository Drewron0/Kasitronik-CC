begin;

-- Collectors have no Supabase account: the server reaches these tables with the secret key only.
create table if not exists public.collectors (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 100),
  phone text not null unique check (phone ~ '^628[0-9]{8,11}$'),
  active boolean not null default true,
  paused boolean not null default false,
  notify_mode text not null default 'instant' check (notify_mode in ('instant', 'digest')),
  access_token_hash text not null unique,
  last_digest_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.collector_areas (
  id uuid primary key default gen_random_uuid(),
  collector_id uuid not null references public.collectors(id) on delete cascade,
  center_latitude double precision not null check (center_latitude between -90 and 90),
  center_longitude double precision not null check (center_longitude between -180 and 180),
  radius_km numeric not null check (radius_km between 1 and 30)
);
create index if not exists collector_areas_collector on public.collector_areas (collector_id);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  collector_id uuid not null references public.collectors(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
create index if not exists push_subscriptions_collector on public.push_subscriptions (collector_id);

alter table public.item_submissions
  add column if not exists owner_phone text check (owner_phone is null or owner_phone ~ '^628[0-9]{8,11}$'),
  add column if not exists pickup_district text not null default '',
  add column if not exists collector_id uuid references public.collectors(id) on delete set null,
  add column if not exists handover_code text check (handover_code is null or handover_code ~ '^[0-9]{4}$'),
  add column if not exists handover_attempts integer not null default 0,
  add column if not exists handover_locked_until timestamptz,
  add column if not exists agreed_price_idr integer check (agreed_price_idr is null or agreed_price_idr between 0 and 100000000),
  add column if not exists claimed_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists last_wave_at timestamptz,
  add column if not exists wave_count integer not null default 0,
  add column if not exists collector_rating integer check (collector_rating is null or collector_rating between 1 and 5),
  add column if not exists collector_review text check (collector_review is null or length(collector_review) <= 500),
  add column if not exists rated_at timestamptz;
create index if not exists item_submissions_status_wave on public.item_submissions (status, last_wave_at);

-- Reports already open before this migration need a code, or no collector could ever complete them.
update public.item_submissions
  set handover_code = lpad(floor(random() * 10000)::int::text, 4, '0')
  where handover_code is null and status in ('pending', 'accepted');
create index if not exists item_submissions_collector on public.item_submissions (collector_id);

create table if not exists public.job_offers (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.item_submissions(id) on delete cascade,
  collector_id uuid not null references public.collectors(id) on delete cascade,
  token_hash text not null unique,
  wave integer not null check (wave >= 0),
  status text not null default 'sent' check (status in ('sent', 'claimed', 'lost', 'released', 'cancelled')),
  sent_at timestamptz not null default now(),
  opened_at timestamptz,
  unique (submission_id, collector_id)
);
create index if not exists job_offers_submission on public.job_offers (submission_id);

create table if not exists public.notification_log (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('push', 'email')),
  kind text not null,
  recipient text not null,
  payload jsonb not null,
  status text not null check (status in ('sent', 'failed')),
  attempts integer not null default 1,
  last_error text,
  created_at timestamptz not null default now()
);
create index if not exists notification_log_failed on public.notification_log (status, attempts) where status = 'failed';

create table if not exists public.problem_reports (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.item_submissions(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  message text not null check (length(trim(message)) between 10 and 1000),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.collectors enable row level security;
alter table public.collector_areas enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.job_offers enable row level security;
alter table public.notification_log enable row level security;
alter table public.problem_reports enable row level security;
revoke all on public.collectors from anon, authenticated;
revoke all on public.collector_areas from anon, authenticated;
revoke all on public.push_subscriptions from anon, authenticated;
revoke all on public.job_offers from anon, authenticated;
revoke all on public.notification_log from anon, authenticated;
revoke all on public.problem_reports from anon, authenticated;

-- Status changes now go through server routes; owners keep only rating rights.
drop policy if exists "Update own submissions" on public.item_submissions;
drop policy if exists "Cancel own pending submissions" on public.item_submissions;
revoke update (status) on public.item_submissions from authenticated;
grant update (collector_rating, collector_review, rated_at) on public.item_submissions to authenticated;
create policy "Rate own completed submissions" on public.item_submissions for update to authenticated
  using (owner_id = (select auth.uid()) and status = 'completed')
  with check (owner_id = (select auth.uid()) and status = 'completed');

drop policy if exists "Submit own items" on public.item_submissions;
create policy "Submit own items" on public.item_submissions for insert to authenticated
  with check (owner_id = (select auth.uid()) and status = 'pending'
    and collector_id is null and agreed_price_idr is null and claimed_at is null and completed_at is null
    and collector_rating is null and collector_review is null and rated_at is null
    and wave_count = 0 and last_wave_at is null and handover_attempts = 0 and handover_locked_until is null
    and handover_code is not null
    and exists (select 1 from storage.objects where bucket_id = 'submission-photos' and name = photo_path));

create or replace function public.get_my_submission_collectors()
returns table (submission_id uuid, collector_name text, collector_phone text, collector_rating numeric, completed_jobs integer)
language sql stable security definer set search_path = public as $$
  select s.id, c.name, c.phone,
    (select round(avg(r.collector_rating)::numeric, 1) from public.item_submissions r
      where r.collector_id = c.id and r.collector_rating is not null),
    (select count(*)::integer from public.item_submissions d where d.collector_id = c.id and d.status = 'completed')
  from public.item_submissions s
  join public.collectors c on c.id = s.collector_id
  where s.owner_id = auth.uid();
$$;
revoke all on function public.get_my_submission_collectors() from public, anon;
grant execute on function public.get_my_submission_collectors() to authenticated;

commit;
