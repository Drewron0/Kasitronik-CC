begin;

-- Grant updates on status column to authenticated role
grant update (status) on public.item_submissions to authenticated;

-- Allow owners to update their own submissions (supports lifecycle transitions)
drop policy if exists "Cancel own pending submissions" on public.item_submissions;
drop policy if exists "Update own submissions" on public.item_submissions;

create policy "Update own submissions" on public.item_submissions
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

commit;
