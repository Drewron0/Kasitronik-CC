import { test } from "node:test";
import assert from "node:assert/strict";
import { dispatchWave } from "../lib/collector/services/dispatch.ts";
import { hashToken } from "../lib/collector/tokens.ts";
import { reverseDistrict } from "../lib/location/reverse-district.ts";
import { parseOwnerPhone } from "../app/reports/owner-phone.ts";
import { createMemoryStore } from "./helpers/memory-store.mjs";
import { createFakeNotifier } from "./helpers/fake-notifier.mjs";
import { collector, submission } from "./helpers/fixtures.mjs";

const NOW = new Date("2026-11-24T10:00:00.000Z");
const area = (latitude, longitude) => [{ latitude, longitude, radiusKm: 10 }];

function setup(collectors) {
  const store = createMemoryStore({
    collectors,
    submissions: [submission()],
    pushTargets: collectors.map(c => ({ collectorId: c.id, endpoint: `https://push/${c.id}`, p256dh: "p", auth: "a" })),
  });
  const notifier = createFakeNotifier();
  return { store, notifier, ctx: { store, notifier, now: NOW, appUrl: "https://k.test" } };
}

test("dispatch offers the three nearest and stores tokens hashed", async () => {
  const { store, notifier, ctx } = setup([
    collector("far", { areas: area(-7.1, 110.44) }),
    collector("near", { areas: area(-7.051, 110.44) }),
    collector("mid", { areas: area(-7.06, 110.44) }),
    collector("fourth", { areas: area(-7.12, 110.44) }),
  ]);
  assert.deepEqual(await dispatchWave(ctx, "sub-1"), { offered: 3, wave: 1 });
  assert.deepEqual(notifier.pushes.map(p => p.target.endpoint), ["https://push/near", "https://push/mid", "https://push/far"]);
  const stored = JSON.stringify(store.db.offers);
  for (const { payload } of notifier.pushes) {
    const token = payload.url.match(/\/j\/([A-Za-z0-9_-]{43})$/)[1];
    assert.ok(store.db.offers.some(o => o.tokenHash === hashToken(token)));
    assert.equal(stored.includes(token), false);
    assert.doesNotMatch(payload.body, /Banjarsari/);
  }
  assert.deepEqual(store.db.offers.map(o => o.wave), [1, 1, 1]);
  const sub = await store.getSubmission("sub-1");
  assert.equal(sub.waveCount, 1);
  assert.equal(sub.lastWaveAt, NOW.toISOString());
});

test("second wave skips collectors already offered", async () => {
  const { store, notifier, ctx } = setup(["a", "b", "c", "d"].map(id => collector(id)));
  await dispatchWave(ctx, "sub-1");
  notifier.pushes.length = 0;
  assert.deepEqual(await dispatchWave(ctx, "sub-1"), { offered: 1, wave: 2 });
  assert.equal(store.db.offers.length, 4);
  assert.equal(store.db.offers.at(-1).wave, 2);
});

test("dispatch with no candidates offers nothing", async () => {
  const { store, notifier, ctx } = setup([collector("x", { paused: true })]);
  assert.deepEqual(await dispatchWave(ctx, "sub-1"), { offered: 0, wave: 1 });
  assert.equal(notifier.pushes.length, 0);
  assert.equal((await store.getSubmission("sub-1")).waveCount, 1);
});

test("dispatch ignores submissions that are no longer pending", async () => {
  const { store, ctx } = setup([collector("a")]);
  store.db.submissions[0].status = "accepted";
  assert.deepEqual(await dispatchWave(ctx, "sub-1"), { offered: 0, wave: null });
  assert.equal(store.db.offers.length, 0);
});

test("reverse district falls back to empty on failure", async () => {
  const point = { latitude: -7.05, longitude: 110.44 };
  assert.equal(await reverseDistrict("key", point, async () => { throw new Error("down"); }), "");
  assert.equal(await reverseDistrict("key", point, async () => new Response("no", { status: 500 })), "");
  assert.equal(await reverseDistrict("", point, async () => { throw new Error("must not call"); }), "");
  assert.equal(await reverseDistrict("key", point, async () => Response.json({ results: [{ city: "Semarang" }] })), "Semarang");
  assert.equal(await reverseDistrict("key", point, async () => Response.json({ results: [{ suburb: "Tembalang", district: "X", city: "Semarang" }] })), "Tembalang");
  let called = "";
  await reverseDistrict("k1", point, async url => { called = String(url); return Response.json({ results: [] }); });
  assert.match(called, /^https:\/\/api\.geoapify\.com\/v1\/geocode\/reverse\?/);
  assert.match(called, /lat=-7\.05/);
  assert.match(called, /lon=110\.44/);
});

test("owner phone is required and normalized", () => {
  const form = value => { const f = new FormData(); if (value !== undefined) f.set("ownerPhone", value); return f; };
  assert.deepEqual(parseOwnerPhone(form("0812 3456 7890")), { owner_phone: "6281234567890" });
  for (const bad of [undefined, "", "123"]) {
    assert.throws(() => parseOwnerPhone(form(bad)), { message: "Isi nomor WhatsApp yang aktif, contoh 0812 3456 7890." });
  }
});
