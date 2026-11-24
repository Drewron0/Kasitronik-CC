import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { claimSubmission } from "../lib/collector/services/claim.ts";
import { completeJob } from "../lib/collector/services/complete.ts";
import { releaseJob } from "../lib/collector/services/release.ts";
import { releaseHeldJobs } from "../lib/collector/services/deactivate.ts";
import { dispatchWave } from "../lib/collector/services/dispatch.ts";
import { decideWave } from "../lib/collector/candidates.ts";
import { getNotifier } from "../lib/notifications/get-notifier.ts";
import { MAX_WAVES } from "../lib/collector/rules.ts";
import { createMemoryStore } from "./helpers/memory-store.mjs";
import { createFakeNotifier } from "./helpers/fake-notifier.mjs";
import { collector, submission } from "./helpers/fixtures.mjs";

const NOW = new Date("2026-11-24T10:00:00.000Z");

function setup(sub = {}, collectors = [collector("A"), collector("B")]) {
  const store = createMemoryStore({ collectors, submissions: [submission(sub)], ownerEmails: { "owner-1": "w@example.com" } });
  const notifier = createFakeNotifier();
  return { store, notifier, ctx: { store, notifier, now: NOW, appUrl: "https://k.test", adminEmail: "admin@example.com" } };
}

test("parallel wrong codes cannot exceed the attempt limit", async () => {
  const { store, ctx } = setup({ status: "accepted", collectorId: "A", handoverCode: "0019" });
  const codes = Array.from({ length: 20 }, (_, i) => String(i).padStart(4, "0"));
  const results = await Promise.all(codes.map(code => completeJob(ctx, "A", "sub-1", code, "")));
  assert.ok(results.filter(r => r.kind === "wrong_code").length <= 4, JSON.stringify(results.map(r => r.kind)));
  const sub = await store.getSubmission("sub-1");
  assert.ok(sub.handoverAttempts <= 5);
  if (sub.status === "completed") assert.fail("right code must not get through after the limit");
});

test("release after escalation offers the job again", async () => {
  const { store, ctx } = setup({ status: "accepted", collectorId: "A", waveCount: MAX_WAVES + 1, lastWaveAt: "2026-11-24T08:00:00.000Z" });
  assert.equal((await releaseJob(ctx, "A", "sub-1")).kind, "released");
  const sub = await store.getSubmission("sub-1");
  assert.equal(sub.waveCount, 0);
  assert.equal(decideWave(sub, NOW), "wave");
});

test("deactivating a collector releases every job they hold", async () => {
  const { store, notifier, ctx } = setup({ status: "accepted", collectorId: "A" });
  store.db.submissions.push(submission({ id: "sub-2", status: "accepted", collectorId: "A" }), submission({ id: "sub-3", status: "accepted", collectorId: "B" }));
  assert.equal(await releaseHeldJobs(ctx, "A"), 2);
  assert.equal((await store.getSubmission("sub-1")).status, "pending");
  assert.equal((await store.getSubmission("sub-2")).collectorId, null);
  assert.equal((await store.getSubmission("sub-3")).collectorId, "B");
  assert.equal(notifier.emails.length, 2);
});

test("missing credentials in production fail instead of pretending to send", async () => {
  const notifier = getNotifier({ NODE_ENV: "production" });
  const push = await notifier.push({ endpoint: "e", p256dh: "p", auth: "a" }, { title: "t", body: "b", url: "u", tag: "x" });
  const email = await notifier.email({ to: "a@b.c", subject: "s", text: "code 0427" });
  assert.equal(push.ok, false);
  assert.equal(email.ok, false);
});

test("a wave with no collectors left escalates on the next tick", async () => {
  const { store, ctx } = setup({}, [collector("far", { areas: [{ latitude: -6.2, longitude: 106.8, radiusKm: 5 }] })]);
  assert.equal((await dispatchWave(ctx, "sub-1")).offered, 0);
  const sub = await store.getSubmission("sub-1");
  assert.equal(sub.waveCount, MAX_WAVES);
  assert.equal(decideWave(sub, NOW), "escalate");
});

test("a claim that follows a release is still possible", async () => {
  const { ctx } = setup({ status: "accepted", collectorId: "A" });
  await releaseJob(ctx, "A", "sub-1");
  assert.equal((await claimSubmission(ctx, "B", "sub-1")).kind, "claimed");
});

const sql = (await readFile(new URL("../supabase/migrations/202611240001_collectors.sql", import.meta.url), "utf8")).toLowerCase();

test("insert policy blocks forged ratings and dispatch state", () => {
  const policy = sql.slice(sql.indexOf('create policy "submit own items"'));
  const body = policy.slice(0, policy.indexOf(";"));
  for (const clause of ["collector_rating is null", "rated_at is null", "wave_count = 0", "handover_attempts = 0", "handover_code is not null"]) {
    assert.match(body, new RegExp(clause.replace(/ /g, "\\s+")), clause);
  }
});

test("legacy open reports get a handover code", () => {
  assert.match(sql, /update public\.item_submissions\s+set handover_code\s*=/);
  assert.match(sql, /where handover_code is null and status in \('pending', 'accepted'\)/);
});
