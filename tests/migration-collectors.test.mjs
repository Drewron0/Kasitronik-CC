import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const sql = (await readFile(new URL("../supabase/migrations/202611240001_collectors.sql", import.meta.url), "utf8")).toLowerCase();
const privateTables = ["collectors", "collector_areas", "push_subscriptions", "job_offers", "notification_log", "problem_reports"];

test("owners can no longer update their own submissions freely", () => {
  assert.match(sql, /drop policy if exists "update own submissions"/);
  assert.match(sql, /revoke update \(status\) on public\.item_submissions from authenticated/);
});

test("every new table has row level security and no client grants", () => {
  for (const table of privateTables) {
    assert.match(sql, new RegExp(`create table if not exists public\\.${table} `), table);
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`), table);
    assert.match(sql, new RegExp(`revoke all on public\\.${table} from anon, authenticated`), table);
    assert.doesNotMatch(sql, new RegExp(`grant [^;]* on public\\.${table} to`), table);
  }
});

test("insert policy forbids forged collector or price", () => {
  const policy = sql.slice(sql.indexOf('create policy "submit own items"'));
  const body = policy.slice(0, policy.indexOf(";"));
  assert.match(body, /collector_id is null/);
  assert.match(body, /agreed_price_idr is null/);
  assert.match(body, /status = 'pending'/);
});

test("owners may rate only completed submissions", () => {
  assert.match(sql, /grant update \(collector_rating, collector_review, rated_at\) on public\.item_submissions to authenticated/);
  const policy = sql.slice(sql.indexOf('create policy "rate own completed submissions"'));
  assert.match(policy.slice(0, policy.indexOf(";")), /status = 'completed'/);
});

test("new submission columns are idempotent", () => {
  const adds = sql.match(/add column[^,;]*/g) ?? [];
  assert.ok(adds.length >= 14);
  for (const add of adds) assert.match(add, /add column if not exists/, add);
});

test("owners read collector details through a scoped function", () => {
  assert.match(sql, /create or replace function public\.get_my_submission_collectors\(\)/);
  assert.match(sql, /security definer/);
  assert.match(sql, /set search_path = public/);
  assert.match(sql, /owner_id = auth\.uid\(\)/);
  assert.match(sql, /grant execute on function public\.get_my_submission_collectors\(\) to authenticated/);
});
