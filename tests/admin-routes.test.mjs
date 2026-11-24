import { test } from "node:test";
import assert from "node:assert/strict";
import { createCollectorEntry, listAttention, listCollectorRows, resolveProblemEntry, updateCollectorEntry } from "../lib/collector/services/admin.ts";
import { isAdminUser } from "../lib/auth/is-admin.ts";
import { hashToken } from "../lib/collector/tokens.ts";
import { createMemoryAdminStore } from "./helpers/memory-admin-store.mjs";
import { collector, submission } from "./helpers/fixtures.mjs";

const APP = "https://k.test";
const NOW = new Date("2026-11-24T10:00:00.000Z");
const area = { latitude: -7.05, longitude: 110.44, radiusKm: 5 };
const input = (overrides = {}) => ({ name: "Budi", phone: "0812 3456 7890", notifyMode: "instant", areas: [area], ...overrides });

test("non-admin gets 403", () => {
  assert.equal(isAdminUser({ app_metadata: { role: "admin" } }), true);
  for (const user of [null, {}, { app_metadata: {} }, { app_metadata: { role: "user" } }, { user_metadata: { role: "admin" } }]) {
    assert.equal(isAdminUser(user), false);
  }
});

test("create returns link once and stores only hash", async () => {
  const store = createMemoryAdminStore();
  const result = await createCollectorEntry(store, input(), APP);
  assert.equal(result.ok, true);
  const token = result.link.match(/^https:\/\/k\.test\/p\/([A-Za-z0-9_-]{43})$/)[1];
  const row = store.db.collectors[0];
  assert.equal(row.accessTokenHash, hashToken(token));
  assert.equal(JSON.stringify(store.db).includes(token), false);
  assert.equal(row.phone, "6281234567890");
  assert.deepEqual(row.areas, [area]);
});

test("invalid phone is 400 with field error", async () => {
  const store = createMemoryAdminStore();
  assert.deepEqual(await createCollectorEntry(store, input({ phone: "123" }), APP), { ok: false, field: "phone", error: "Nomor WhatsApp tidak valid." });
  assert.deepEqual(await createCollectorEntry(store, input({ name: "  " }), APP), { ok: false, field: "name", error: "Isi nama pengepul." });
  assert.deepEqual(await createCollectorEntry(store, input({ areas: [] }), APP), { ok: false, field: "areas", error: "Tambahkan minimal satu wilayah." });
  await createCollectorEntry(store, input(), APP);
  assert.deepEqual(await createCollectorEntry(store, input({ name: "Lain" }), APP), { ok: false, field: "phone", error: "Nomor ini sudah terdaftar." });
});

test("reset link invalidates old token", async () => {
  const store = createMemoryAdminStore();
  const created = await createCollectorEntry(store, input(), APP);
  const oldHash = store.db.collectors[0].accessTokenHash;
  const updated = await updateCollectorEntry(store, created.id, { resetLink: true }, APP);
  assert.equal(updated.ok, true);
  assert.match(updated.link, /^https:\/\/k\.test\/p\//);
  assert.notEqual(store.db.collectors[0].accessTokenHash, oldHash);
  assert.notEqual(updated.link, created.link);
});

test("update toggles active and validates fields", async () => {
  const store = createMemoryAdminStore();
  const { id } = await createCollectorEntry(store, input(), APP);
  assert.deepEqual(await updateCollectorEntry(store, id, { active: false }, APP), { ok: true });
  assert.equal(store.db.collectors[0].active, false);
  assert.deepEqual(await updateCollectorEntry(store, id, { phone: "x" }, APP), { ok: false, field: "phone", error: "Nomor WhatsApp tidak valid." });
  assert.deepEqual(await updateCollectorEntry(store, "missing", { active: true }, APP), { ok: false, error: "Pengepul tidak ditemukan." });
});

test("collector rows show push and stats", async () => {
  const store = createMemoryAdminStore({ collectors: [collector("a")], pushCounts: { a: 2 }, stats: { a: { rating: 4.5, completedJobs: 7 } } });
  const [row] = await listCollectorRows(store);
  assert.equal(row.pushEnabled, true);
  assert.equal(row.rating, 4.5);
  assert.equal(row.completedJobs, 7);
  assert.equal("tokenHash" in row || "accessTokenHash" in row, false);
});

test("attention lists escalated reports and unresolved problems only", async () => {
  const store = createMemoryAdminStore({
    submissions: [submission({ id: "esc", waveCount: 4 }), submission({ id: "wave2", waveCount: 2 }), submission({ id: "taken", status: "accepted", waveCount: 4 })],
    problems: [
      { id: "p1", submissionId: "esc", ownerId: "o", message: "Pengepul tidak datang", createdAt: "2026-11-24T09:00:00.000Z", resolvedAt: null },
      { id: "p2", submissionId: "esc", ownerId: "o", message: "Sudah beres kemarin", createdAt: "2026-11-23T09:00:00.000Z", resolvedAt: "2026-11-23T10:00:00.000Z" },
    ],
  });
  const attention = await listAttention(store);
  assert.deepEqual(attention.unclaimed.map(s => s.id), ["esc"]);
  assert.deepEqual(attention.problems.map(p => p.id), ["p1"]);
  assert.equal(await resolveProblemEntry(store, "p1", NOW), true);
  assert.equal(await resolveProblemEntry(store, "p1", NOW), false);
  assert.deepEqual((await listAttention(store)).problems, []);
});
