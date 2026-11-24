import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeIndonesianPhone } from "../lib/collector/phone.ts";
import { createAccessToken, hashToken } from "../lib/collector/tokens.ts";
import { areaCovers, distanceKm } from "../lib/collector/geo.ts";
import { checkHandover, createHandoverCode } from "../lib/collector/handover.ts";
import { parsePriceIdr } from "../lib/collector/price.ts";
import { decideWave, selectCandidates } from "../lib/collector/candidates.ts";

test("phone normalizes Indonesian formats", () => {
  assert.equal(normalizeIndonesianPhone("0812 3456 7890"), "6281234567890");
  assert.equal(normalizeIndonesianPhone("+62-812-3456-7890"), "6281234567890");
  assert.equal(normalizeIndonesianPhone("81234567890"), "6281234567890");
  assert.equal(normalizeIndonesianPhone("(0812) 3456.7890"), "6281234567890");
  for (const bad of ["abc", "0812", "+1 415 555 0100", "0812345678901234", "", "0812-3456-789O"]) {
    assert.equal(normalizeIndonesianPhone(bad), null, bad);
  }
});

test("tokens are random and hashed", () => {
  const a = createAccessToken();
  const b = createAccessToken();
  assert.notEqual(a.token, b.token);
  assert.equal(a.token.length, 43);
  assert.match(a.token, /^[A-Za-z0-9_-]+$/);
  assert.equal(hashToken(a.token), a.hash);
  assert.equal(a.hash.length, 64);
});

test("area coverage uses radius", () => {
  const area = { latitude: -7.05, longitude: 110.44, radiusKm: 3 };
  assert.equal(areaCovers(area, { latitude: -7.06, longitude: 110.45 }), true);
  assert.equal(areaCovers(area, { latitude: -7.1, longitude: 110.44 }), false);
  assert.equal(distanceKm({ latitude: 1, longitude: 2 }, { latitude: 1, longitude: 2 }), 0);
  assert.ok(Math.abs(distanceKm({ latitude: 0, longitude: 0 }, { latitude: 1, longitude: 0 }) - 111.19) < 0.1);
});

test("handover code is four digits", () => {
  for (let i = 0; i < 50; i++) assert.match(createHandoverCode(), /^[0-9]{4}$/);
});

test("handover locks after five wrong codes", () => {
  const now = new Date("2026-11-24T10:00:00.000Z");
  const wrong = checkHandover({ code: "0427", attempts: 4, lockedUntil: null }, "1111", now);
  assert.deepEqual(wrong, { kind: "wrong", attempts: 5, lockedUntil: "2026-11-24T10:15:00.000Z" });
  assert.deepEqual(checkHandover({ code: "0427", attempts: 1, lockedUntil: null }, "1111", now), { kind: "wrong", attempts: 2, lockedUntil: null });
  assert.deepEqual(checkHandover({ code: "0427", attempts: 5, lockedUntil: "2026-11-24T10:15:00.000Z" }, "0427", now), { kind: "locked", lockedUntil: "2026-11-24T10:15:00.000Z" });
  assert.deepEqual(checkHandover({ code: "0427", attempts: 5, lockedUntil: "2026-11-24T09:59:00.000Z" }, "0427", now), { kind: "ok" });
  assert.deepEqual(checkHandover({ code: "0427", attempts: 5, lockedUntil: "2026-11-24T09:59:00.000Z" }, "1111", now), { kind: "wrong", attempts: 1, lockedUntil: null });
  assert.deepEqual(checkHandover({ code: "0427", attempts: 0, lockedUntil: null }, " 0427 ", now), { kind: "ok" });
});

test("price parsing", () => {
  assert.equal(parsePriceIdr(""), null);
  assert.equal(parsePriceIdr("   "), null);
  assert.equal(parsePriceIdr("Rp 150.000"), 150000);
  assert.equal(parsePriceIdr("150,000"), 150000);
  assert.equal(parsePriceIdr("0"), 0);
  for (const bad of ["-5", "100000001", "abc", "12.5"]) assert.equal(parsePriceIdr(bad), "invalid", bad);
});

const point = { latitude: -7.05, longitude: 110.44 };
const area = (lat, lng, radiusKm = 10) => ({ latitude: lat, longitude: lng, radiusKm });
const collector = (id, overrides = {}) => ({ id, active: true, paused: false, notifyMode: "instant", areas: [area(-7.05, 110.44)], ...overrides });

test("candidates skip paused, digest, offered, out of area and sort by distance", () => {
  const collectors = [
    collector("far", { areas: [area(-7.1, 110.44)] }),
    collector("near", { areas: [area(-7.051, 110.44), area(-8, 112, 1)] }),
    collector("paused", { paused: true }),
    collector("digest", { notifyMode: "digest" }),
    collector("offered"),
    collector("inactive", { active: false }),
    collector("outside", { areas: [area(-6, 106, 5)] }),
    collector("mid", { areas: [area(-7.06, 110.44)] }),
    collector("fourth", { areas: [area(-7.12, 110.44)] }),
  ];
  const result = selectCandidates(collectors, point, new Set(["offered"]));
  assert.deepEqual(result.map(c => c.id), ["near", "mid", "far"]);
});

test("wave decision", () => {
  const now = new Date("2026-11-24T10:00:00.000Z");
  const ago = minutes => new Date(now.getTime() - minutes * 60_000).toISOString();
  assert.equal(decideWave({ status: "pending", waveCount: 0, lastWaveAt: null }, now), "wave");
  assert.equal(decideWave({ status: "pending", waveCount: 1, lastWaveAt: ago(29) }, now), "none");
  assert.equal(decideWave({ status: "pending", waveCount: 1, lastWaveAt: ago(31) }, now), "wave");
  assert.equal(decideWave({ status: "pending", waveCount: 3, lastWaveAt: ago(31) }, now), "escalate");
  assert.equal(decideWave({ status: "pending", waveCount: 3, lastWaveAt: ago(10) }, now), "none");
  assert.equal(decideWave({ status: "pending", waveCount: 4, lastWaveAt: ago(120) }, now), "none");
  assert.equal(decideWave({ status: "accepted", waveCount: 0, lastWaveAt: null }, now), "none");
});
