import { test } from "node:test";
import assert from "node:assert/strict";
import { claimMessage, completeMessage, INVALID_LINK, releaseMessage } from "../app/collector/action-messages.ts";
import { validateAreas } from "../app/collector/areas.ts";

test("complete action maps wrong code to field error", () => {
  assert.deepEqual(completeMessage({ kind: "wrong_code", attemptsLeft: 3 }), { ok: false, field: "code", error: "Kode salah. Sisa 3 percobaan." });
});

test("complete action maps lock to a code field error with the unlock time", () => {
  const result = completeMessage({ kind: "locked", lockedUntil: "2026-11-24T03:15:00.000Z" });
  assert.equal(result.ok, false);
  assert.equal(result.field, "code");
  assert.match(result.error, /^Terlalu banyak kode salah\. Coba lagi pukul 10\.15 WIB\.$/);
});

test("complete action maps invalid price", () => {
  assert.deepEqual(completeMessage({ kind: "invalid_price" }), { ok: false, field: "price", error: "Isi harga dalam rupiah, contoh 150000." });
});

test("complete and release success", () => {
  assert.deepEqual(completeMessage({ kind: "completed" }), { ok: true });
  assert.deepEqual(releaseMessage({ kind: "released" }), { ok: true });
});

test("claim results read plainly", () => {
  assert.deepEqual(claimMessage({ kind: "claimed" }), { ok: true });
  assert.deepEqual(claimMessage({ kind: "taken" }), { ok: false, error: "Laporan ini sudah diambil pengepul lain." });
  assert.deepEqual(claimMessage({ kind: "closed" }), { ok: false, error: "Laporan ini sudah ditutup." });
  assert.deepEqual(claimMessage({ kind: "not_found" }), { ok: false, error: "Laporan tidak ditemukan." });
});

test("actions without a valid collector", () => {
  assert.deepEqual(INVALID_LINK, { ok: false, error: "Link tidak berlaku. Minta link baru ke tim Kasitronik." });
  assert.deepEqual(completeMessage({ kind: "not_yours" }), { ok: false, error: "Laporan ini bukan milik Anda lagi." });
});

test("saveAreas rejects six areas and clamps radius", () => {
  const area = radiusKm => ({ latitude: -7.05, longitude: 110.44, radiusKm });
  assert.deepEqual(validateAreas([area(0.2), area(80), area(5)]), { ok: true, areas: [area(1), area(30), area(5)] });
  assert.deepEqual(validateAreas(Array.from({ length: 6 }, () => area(5))), { ok: false, error: "Maksimal 5 wilayah." });
  assert.deepEqual(validateAreas([]), { ok: false, error: "Tambahkan minimal satu wilayah." });
  assert.deepEqual(validateAreas([{ latitude: 200, longitude: 0, radiusKm: 5 }]), { ok: false, error: "Titik wilayah tidak valid." });
  assert.deepEqual(validateAreas("nope"), { ok: false, error: "Tambahkan minimal satu wilayah." });
  assert.deepEqual(validateAreas([{ latitude: -7, longitude: 110, radiusKm: "x" }]), { ok: false, error: "Titik wilayah tidak valid." });
});
