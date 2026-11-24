import { test } from "node:test";
import assert from "node:assert/strict";
import { claimSubmission } from "../lib/collector/services/claim.ts";
import { completeJob } from "../lib/collector/services/complete.ts";
import { releaseJob } from "../lib/collector/services/release.ts";
import { buildJobView } from "../lib/collector/services/job-view.ts";
import { notifyCollector } from "../lib/collector/services/notify.ts";
import { decideWave } from "../lib/collector/candidates.ts";
import { createMemoryStore } from "./helpers/memory-store.mjs";
import { createFakeNotifier } from "./helpers/fake-notifier.mjs";
import { collector, submission } from "./helpers/fixtures.mjs";

const NOW = new Date("2026-11-24T10:00:00.000Z");

function setup({ sub = {}, notifier = createFakeNotifier() } = {}) {
  const store = createMemoryStore({
    collectors: [collector("A", { name: "Andi" }), collector("B", { name: "Budi" })],
    submissions: [submission(sub)],
    offers: [
      { id: "o-A", submissionId: "sub-1", collectorId: "A", tokenHash: "ta", wave: 1, status: "sent", openedAt: null },
      { id: "o-B", submissionId: "sub-1", collectorId: "B", tokenHash: "tb", wave: 1, status: "sent", openedAt: null },
    ],
    pushTargets: [{ collectorId: "A", endpoint: "https://push/a", p256dh: "p", auth: "x" }],
    ownerEmails: { "owner-1": "warga@example.com" },
    ratings: { A: 4.5 },
  });
  const ctx = { store, notifier, now: NOW, appUrl: "https://k.test", adminEmail: "admin@example.com" };
  return { store, notifier, ctx };
}

const offerStatus = (store, collectorId) => store.db.offers.find(o => o.collectorId === collectorId).status;
const PRIVATE_FIELDS = ["address", "instructions", "ownerPhone", "handoverCode", "latitude", "longitude"];

test("claim race", async () => {
  const { store, notifier, ctx } = setup();
  const [a, b] = await Promise.all([claimSubmission(ctx, "A", "sub-1"), claimSubmission(ctx, "B", "sub-1")]);
  assert.deepEqual([a.kind, b.kind].sort(), ["claimed", "taken"]);
  const winner = a.kind === "claimed" ? "A" : "B";
  const loser = winner === "A" ? "B" : "A";
  assert.equal(notifier.emails.length, 1);
  assert.equal(notifier.emails[0].to, "warga@example.com");
  assert.equal(offerStatus(store, winner), "claimed");
  assert.equal(offerStatus(store, loser), "lost");
  const sub = await store.getSubmission("sub-1");
  assert.equal(sub.status, "accepted");
  assert.equal(sub.collectorId, winner);
  assert.equal(sub.claimedAt, NOW.toISOString());
});

test("claiming twice by the same collector stays claimed without a second email", async () => {
  const { notifier, ctx } = setup();
  assert.equal((await claimSubmission(ctx, "A", "sub-1")).kind, "claimed");
  assert.equal((await claimSubmission(ctx, "A", "sub-1")).kind, "claimed");
  assert.equal(notifier.emails.length, 1);
});

test("claim of unknown or closed submission", async () => {
  const { ctx } = setup({ sub: { status: "cancelled" } });
  assert.equal((await claimSubmission(ctx, "A", "missing")).kind, "not_found");
  assert.equal((await claimSubmission(ctx, "A", "sub-1")).kind, "closed");
});

test("claim from the collector home records an offer", async () => {
  const { store, ctx } = setup();
  store.db.collectors.push(collector("C"));
  assert.equal((await claimSubmission(ctx, "C", "sub-1")).kind, "claimed");
  assert.equal(offerStatus(store, "C"), "claimed");
});

test("stale offer", async () => {
  const cancelled = setup({ sub: { status: "cancelled" } });
  const closedView = await buildJobView(cancelled.ctx, "A", "sub-1");
  assert.equal(closedView.state, "closed");

  const { ctx } = setup();
  await claimSubmission(ctx, "B", "sub-1");
  const takenView = await buildJobView(ctx, "A", "sub-1");
  assert.equal(takenView.state, "taken");
  for (const view of [closedView, takenView]) {
    for (const field of PRIVATE_FIELDS) assert.equal(field in view, false, field);
  }
});

test("open view hides contact details", async () => {
  const { ctx } = setup();
  const view = await buildJobView(ctx, "A", "sub-1");
  assert.equal(view.state, "open");
  assert.equal(view.district, "Tembalang");
  assert.equal(typeof view.distanceKm, "number");
  for (const field of PRIVATE_FIELDS) assert.equal(field in view, false, field);
});

test("mine view reveals contact but never the code", async () => {
  const { ctx } = setup();
  await claimSubmission(ctx, "B", "sub-1");
  const view = await buildJobView(ctx, "B", "sub-1");
  assert.equal(view.state, "mine");
  assert.equal(view.ownerPhone, "6281234567890");
  assert.equal(view.address, "Jl. Banjarsari 12");
  assert.equal("handoverCode" in view, false);
  assert.equal(JSON.stringify(view).includes("0427"), false);
});

test("complete with right code and price", async () => {
  const { store, notifier, ctx } = setup();
  await claimSubmission(ctx, "A", "sub-1");
  notifier.emails.length = 0;
  assert.deepEqual(await completeJob(ctx, "A", "sub-1", "0427", "Rp 150.000"), { kind: "completed" });
  const sub = await store.getSubmission("sub-1");
  assert.equal(sub.status, "completed");
  assert.equal(sub.agreedPriceIdr, 150000);
  assert.equal(sub.completedAt, NOW.toISOString());
  assert.equal(notifier.emails.length, 1);
  assert.match(notifier.emails[0].text, /Rp 150\.000/);
  assert.equal((await buildJobView(ctx, "A", "sub-1")).state, "done");
});

test("complete with empty price records a free handover", async () => {
  const { store, ctx } = setup();
  await claimSubmission(ctx, "A", "sub-1");
  assert.equal((await completeJob(ctx, "A", "sub-1", "0427", "")).kind, "completed");
  assert.equal((await store.getSubmission("sub-1")).agreedPriceIdr, null);
});

test("complete with wrong code counts down then locks", async () => {
  const { store, ctx } = setup();
  await claimSubmission(ctx, "A", "sub-1");
  const results = [];
  for (let i = 0; i < 5; i++) results.push(await completeJob(ctx, "A", "sub-1", "9999", ""));
  assert.deepEqual(results.slice(0, 4).map(r => r.attemptsLeft), [4, 3, 2, 1]);
  assert.equal(results[4].kind, "locked");
  assert.equal((await completeJob(ctx, "A", "sub-1", "0427", "")).kind, "locked");
  assert.equal((await store.getSubmission("sub-1")).status, "accepted");
});

test("invalid price does not spend an attempt", async () => {
  const { store, ctx } = setup();
  await claimSubmission(ctx, "A", "sub-1");
  assert.deepEqual(await completeJob(ctx, "A", "sub-1", "9999", "abc"), { kind: "invalid_price" });
  assert.equal((await store.getSubmission("sub-1")).handoverAttempts, 0);
});

test("complete by another collector", async () => {
  const { store, ctx } = setup();
  await claimSubmission(ctx, "A", "sub-1");
  assert.deepEqual(await completeJob(ctx, "B", "sub-1", "0427", ""), { kind: "not_yours" });
  assert.equal((await store.getSubmission("sub-1")).status, "accepted");
});

test("release reopens for dispatch", async () => {
  const { store, notifier, ctx } = setup();
  await claimSubmission(ctx, "A", "sub-1");
  notifier.emails.length = 0;
  assert.deepEqual(await releaseJob(ctx, "A", "sub-1"), { kind: "released" });
  const sub = await store.getSubmission("sub-1");
  assert.equal(sub.status, "pending");
  assert.equal(sub.collectorId, null);
  assert.equal(offerStatus(store, "A"), "released");
  assert.equal(decideWave(sub, NOW), "wave");
  assert.equal(notifier.emails.length, 1);
  assert.deepEqual(await releaseJob(ctx, "B", "sub-1"), { kind: "not_yours" });
});

test("push gone removes subscription", async () => {
  const { store, ctx } = setup({ notifier: createFakeNotifier({ gonePush: true }) });
  await notifyCollector(ctx, "A", "offer", { title: "t", body: "b", url: "u", tag: "x" });
  assert.deepEqual(await store.listPushTargets("A"), []);
  assert.equal(store.db.notifications.length, 1);
  assert.equal(store.db.notifications[0].status, "failed");
});

test("failed email is logged for retry", async () => {
  const { store, ctx } = setup({ notifier: createFakeNotifier({ failEmail: true }) });
  assert.equal((await claimSubmission(ctx, "A", "sub-1")).kind, "claimed");
  const failed = store.db.notifications.filter(n => n.channel === "email");
  assert.equal(failed.length, 1);
  assert.equal(failed[0].status, "failed");
  assert.equal(failed[0].attempts, 1);
});

test("collectors outside the area without an offer cannot see or claim a job", async () => {
  const { store, ctx } = setup();
  store.db.collectors.push(collector("far", { areas: [{ latitude: -6.2, longitude: 106.8, radiusKm: 5 }] }));
  assert.equal((await buildJobView(ctx, "far", "sub-1")).state, "closed");
  assert.equal((await claimSubmission(ctx, "far", "sub-1")).kind, "closed");
  assert.equal((await store.getSubmission("sub-1")).status, "pending");
});
