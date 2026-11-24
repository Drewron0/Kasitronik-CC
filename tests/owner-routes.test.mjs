import { test } from "node:test";
import assert from "node:assert/strict";
import { cancelByOwner, reportProblem } from "../lib/collector/services/owner.ts";
import { formatPriceLabel, parseRating } from "../app/dashboard/rating.ts";
import { createMemoryStore } from "./helpers/memory-store.mjs";
import { createFakeNotifier } from "./helpers/fake-notifier.mjs";
import { collector, submission } from "./helpers/fixtures.mjs";

const NOW = new Date("2026-11-24T10:00:00.000Z");

function setup(sub = {}) {
  const store = createMemoryStore({
    collectors: [collector("A")],
    submissions: [submission(sub)],
    offers: [{ id: "o-A", submissionId: "sub-1", collectorId: "A", tokenHash: "ta", wave: 1, status: "claimed", openedAt: null }],
    pushTargets: [{ collectorId: "A", endpoint: "https://push/a", p256dh: "p", auth: "x" }],
  });
  const notifier = createFakeNotifier();
  return { store, notifier, ctx: { store, notifier, now: NOW, appUrl: "https://k.test", adminEmail: "admin@example.com" } };
}

test("cancel accepted notifies collector", async () => {
  const { store, notifier, ctx } = setup({ status: "accepted", collectorId: "A" });
  assert.deepEqual(await cancelByOwner(ctx, "owner-1", "sub-1"), { kind: "cancelled" });
  assert.equal((await store.getSubmission("sub-1")).status, "cancelled");
  assert.equal(notifier.pushes.length, 1);
  assert.match(notifier.pushes[0].payload.title, /dibatalkan/i);
  assert.equal(store.db.offers[0].status, "cancelled");
});

test("cancel pending sends nothing to collectors", async () => {
  const { store, notifier, ctx } = setup();
  assert.deepEqual(await cancelByOwner(ctx, "owner-1", "sub-1"), { kind: "cancelled" });
  assert.equal((await store.getSubmission("sub-1")).status, "cancelled");
  assert.equal(notifier.pushes.length, 0);
});

test("cancel completed is refused", async () => {
  const { store, notifier, ctx } = setup({ status: "completed", collectorId: "A" });
  assert.deepEqual(await cancelByOwner(ctx, "owner-1", "sub-1"), { kind: "conflict" });
  assert.equal((await store.getSubmission("sub-1")).status, "completed");
  assert.equal(notifier.pushes.length, 0);
});

test("cancel by non-owner", async () => {
  const { store, ctx } = setup();
  assert.deepEqual(await cancelByOwner(ctx, "someone-else", "sub-1"), { kind: "not_found" });
  assert.deepEqual(await cancelByOwner(ctx, "owner-1", "missing"), { kind: "not_found" });
  assert.equal((await store.getSubmission("sub-1")).status, "pending");
});

test("problem message length", async () => {
  const { store, notifier, ctx } = setup({ status: "accepted", collectorId: "A" });
  assert.deepEqual(await reportProblem(ctx, "owner-1", "sub-1", "terlambat"), { kind: "invalid" });
  assert.deepEqual(await reportProblem(ctx, "owner-1", "sub-1", "x".repeat(1001)), { kind: "invalid" });
  assert.deepEqual(await reportProblem(ctx, "owner-1", "sub-1", "  Pengepul tidak datang  "), { kind: "reported" });
  assert.equal(store.db.problems.length, 1);
  assert.equal(store.db.problems[0].message, "Pengepul tidak datang");
  assert.equal(notifier.emails.length, 1);
  assert.equal(notifier.emails[0].to, "admin@example.com");
  assert.match(notifier.emails[0].text, /Pengepul tidak datang/);
});

test("problems only for accepted or completed reports of the owner", async () => {
  const pending = setup();
  assert.deepEqual(await reportProblem(pending.ctx, "owner-1", "sub-1", "Pengepul tidak datang"), { kind: "conflict" });
  const accepted = setup({ status: "accepted", collectorId: "A" });
  assert.deepEqual(await reportProblem(accepted.ctx, "other", "sub-1", "Pengepul tidak datang"), { kind: "not_found" });
});

test("rating payload is validated", () => {
  assert.deepEqual(parseRating({ rating: 5, review: "  Ramah dan tepat waktu " }), { ok: true, rating: 5, review: "Ramah dan tepat waktu" });
  assert.deepEqual(parseRating({ rating: 3 }), { ok: true, rating: 3, review: "" });
  for (const rating of [0, 6, 2.5, "4", null]) assert.equal(parseRating({ rating }).ok, false, String(rating));
  assert.equal(parseRating({ rating: 4, review: "x".repeat(501) }).ok, false);
});

test("receipt price label", () => {
  assert.equal(formatPriceLabel(null), "Diberikan gratis");
  assert.equal(formatPriceLabel(150000), "Rp 150.000");
});

test("receipt escapes owner-entered text", async () => {
  const { escapeHtml } = await import("../app/dashboard/utils/escape-html.ts");
  assert.equal(escapeHtml(`<img src=x onerror="a">&'`), "&lt;img src=x onerror=&quot;a&quot;&gt;&amp;&#39;");
});
