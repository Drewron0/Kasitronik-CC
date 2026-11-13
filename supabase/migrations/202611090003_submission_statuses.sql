begin;

-- Expand status constraint to support full collection lifecycle
alter table public.item_submissions drop constraint if exists item_submissions_status_check;

alter table public.item_submissions add constraint item_submissions_status_check check (
  status in ('pending', 'accepted', 'picked_up', 'completed', 'cancelled')
);

-- Grant update permissions on status column to authenticated users
grant update (status) on public.item_submissions to authenticated;

-- Allow owners to cancel their own submissions if still pending
drop policy if exists "Cancel own pending submissions" on public.item_submissions;
create policy "Cancel own pending submissions" on public.item_submissions
  for update to authenticated
  using (owner_id = (select auth.uid()) and status = 'pending')
  with check (owner_id = (select auth.uid()) and status = 'cancelled');

commit;
