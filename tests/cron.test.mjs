import { test } from "node:test";
import assert from "node:assert/strict";
import { runDispatchTick } from "../lib/collector/services/tick.ts";
import { runDigest } from "../lib/collector/services/digest.ts";
import { retryNotifications } from "../lib/collector/services/retry.ts";
import { verifyCronSecret } from "../lib/cron/verify-secret.ts";
import { createMemoryStore } from "./helpers/memory-store.mjs";
import { createFakeNotifier } from "./helpers/fake-notifier.mjs";
import { collector, submission } from "./helpers/fixtures.mjs";

const T0 = new Date("2026-11-24T10:00:00.000Z");
const later = minutes => new Date(T0.getTime() + minutes * 60_000);

function setup({ collectors = [collector("a"), collector("b")], submissions = [submission()], notifier = createFakeNotifier() } = {}) {
  const store = createMemoryStore({
    collectors,
    submissions,
    pushTargets: collectors.map(c => ({ collectorId: c.id, endpoint: `https://push/${c.id}`, p256dh: "p", auth: "a" })),
  });
  const ctx = now => ({ store, notifier, now, appUrl: "https://k.test", adminEmail: "admin@example.com" });
  return { store, notifier, ctx };
}

test("tick twice", async () => {
  const { store, notifier, ctx } = setup();
  const [first, second] = await Promise.all([runDispatchTick(ctx(T0)), runDispatchTick(ctx(T0))]);
  assert.equal(first.waves + second.waves, 1);
  assert.deepEqual(await runDispatchTick(ctx(T0)), { waves: 0, escalated: 0 });
  const pairs = store.db.offers.map(o => `${o.submissionId}:${o.collectorId}`);
  assert.equal(new Set(pairs).size, pairs.length);
  assert.equal(notifier.pushes.length, 2);
});

test("tick waits for the wave interval", async () => {
  const { ctx } = setup();
  await runDispatchTick(ctx(T0));
  assert.equal((await runDispatchTick(ctx(later(29)))).waves, 0);
  assert.equal((await runDispatchTick(ctx(later(31)))).waves, 1);
});

test("tick escalates once when nobody is left to ask", async () => {
  const { notifier, ctx } = setup({ collectors: [] });
  await runDispatchTick(ctx(T0));
  assert.equal(notifier.emails.length, 0);
  assert.deepEqual(await runDispatchTick(ctx(later(5))), { waves: 0, escalated: 1 });
  assert.equal(notifier.emails.length, 1);
  assert.equal(notifier.emails[0].to, "admin@example.com");
  assert.match(notifier.emails[0].subject, /belum terambil/i);
  assert.deepEqual(await runDispatchTick(ctx(later(200))), { waves: 0, escalated: 0 });
  assert.equal(notifier.emails.length, 1);
});

test("tick skips submissions that are not pending", async () => {
  const { notifier, ctx } = setup({ submissions: [submission({ status: "accepted", collectorId: "a" })] });
  assert.deepEqual(await runDispatchTick(ctx(T0)), { waves: 0, escalated: 0 });
  assert.equal(notifier.pushes.length, 0);
});

test("digest counts only new reports in area", async () => {
  const digester = collector("d", { notifyMode: "digest", lastDigestAt: "2026-11-24T08:00:00.000Z" });
  const { store, notifier, ctx } = setup({
    collectors: [digester, collector("instant"), collector("paused", { notifyMode: "digest", paused: true })],
    submissions: [
      submission({ id: "new-1", createdAt: "2026-11-24T09:00:00.000Z" }),
      submission({ id: "new-2", createdAt: "2026-11-24T09:30:00.000Z" }),
      submission({ id: "old", createdAt: "2026-11-24T07:00:00.000Z" }),
      submission({ id: "far", latitude: -6.2, longitude: 106.8, createdAt: "2026-11-24T09:10:00.000Z" }),
      submission({ id: "taken", status: "accepted", createdAt: "2026-11-24T09:20:00.000Z" }),
    ],
  });
  assert.deepEqual(await runDigest(ctx(T0)), { sent: 1 });
  assert.equal(notifier.pushes.length, 1);
  assert.equal(notifier.pushes[0].target.endpoint, "https://push/d");
  assert.match(notifier.pushes[0].payload.body, /\b2\b/);
  assert.equal(notifier.pushes[0].payload.url, "https://k.test/p");
  assert.equal((await store.getCollector("d")).lastDigestAt, T0.toISOString());
  assert.deepEqual(await runDigest(ctx(later(1))), { sent: 0 });
});

test("retry stops after three attempts", async () => {
  const notifier = createFakeNotifier({ failEmail: true });
  const { store, ctx } = setup({ notifier });
  store.db.notifications.push({ id: "n1", channel: "email", kind: "owner_done", recipient: "w@example.com", payload: { to: "w@example.com", subject: "s", text: "t" }, status: "failed", attempts: 1, lastError: "x" });
  assert.deepEqual(await retryNotifications(ctx(T0)), { retried: 1 });
  assert.equal(store.db.notifications[0].attempts, 2);
  await retryNotifications(ctx(T0));
  assert.equal(store.db.notifications[0].attempts, 3);
  assert.deepEqual(await retryNotifications(ctx(T0)), { retried: 0 });
  assert.equal(notifier.emails.length, 2);
});

test("retry marks a delivered notification as sent", async () => {
  const { store, notifier, ctx } = setup();
  store.db.notifications.push({ id: "n2", channel: "push", kind: "offer", recipient: "https://push/a", payload: { collectorId: "a", target: { endpoint: "https://push/a", p256dh: "p", auth: "a" }, payload: { title: "t", body: "b", url: "u", tag: "x" } }, status: "failed", attempts: 1, lastError: "x" });
  await retryNotifications(ctx(T0));
  assert.equal(store.db.notifications[0].status, "sent");
  assert.equal(notifier.pushes.length, 1);
});

test("cron secret", () => {
  const request = header => new Request("https://k.test/api/cron/dispatch", { method: "POST", headers: header === undefined ? {} : { "x-cron-secret": header } });
  assert.equal(verifyCronSecret(request("s3cret-value"), "s3cret-value"), true);
  assert.equal(verifyCronSecret(request("wrong"), "s3cret-value"), false);
  assert.equal(verifyCronSecret(request(undefined), "s3cret-value"), false);
  assert.equal(verifyCronSecret(request(""), ""), false);
  assert.equal(verifyCronSecret(request("anything"), undefined), false);
});

test("tick escalates after three waves when collectors never claim", async () => {
  const many = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"].map(id => collector(id));
  const { notifier, ctx } = setup({ collectors: many });
  for (const minute of [0, 31, 62]) assert.equal((await runDispatchTick(ctx(later(minute)))).waves, 1);
  assert.equal(notifier.emails.length, 0);
  assert.deepEqual(await runDispatchTick(ctx(later(93))), { waves: 0, escalated: 1 });
  assert.equal(notifier.pushes.length, 9);
});
