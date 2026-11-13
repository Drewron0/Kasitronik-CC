import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { emptyDetails, isSuggestion, mergeSuggestion, parseSubmission } from "../app/reports/item-details.ts";
import { normalizeImage } from "../lib/ai/image.ts";
import { takeAssessmentSlot } from "../lib/ai/rate-limit.ts";

const suggestion = { category: "computers", itemName: "Laptop", brandModel: "", quantity: 1, notes: "Layar retak", weightMinKg: 1, weightMaxKg: 3 };

test("validates AI categories, optional unknowns and bounded weight ranges", () => {
  assert.equal(isSuggestion(suggestion), true);
  assert.equal(isSuggestion({ ...suggestion, category: null, quantity: null, weightMinKg: null, weightMaxKg: null }), true);
  for (const invalid of [null, [], {}, { ...suggestion, category: "toString" }, { ...suggestion, quantity: 1.5 },
    { ...suggestion, weightMinKg: null }, { ...suggestion, weightMaxKg: 1 }, { ...suggestion, weightMinKg: 0 },
    { ...suggestion, weightMaxKg: Infinity }, { ...suggestion, weightMaxKg: 1001 }, { ...suggestion, notes: "x".repeat(2001) }]) assert.equal(isSuggestion(invalid), false);
});

test("AI fills only empty fields and never changes function or measured weight", () => {
  const manual = { ...emptyDetails, itemName: "Laptop kuliah", condition: "dead", weightKind: "actual", weightKg: "2.5" };
  const result = mergeSuggestion(manual, suggestion);
  assert.equal(result.itemName, "Laptop kuliah");
  assert.equal(result.category, "computers");
  assert.equal(result.condition, "dead");
  assert.equal(result.weightKind, "actual");
  assert.equal(result.weightKg, "2.5");
  assert.equal(result.weightMinKg, "");
  const empty = mergeSuggestion(emptyDetails, suggestion);
  assert.equal(empty.weightKind, "estimate");
  assert.equal(empty.weightMinKg, "1");
  assert.equal(empty.condition, "");
  assert.deepEqual(mergeSuggestion(empty, { ...suggestion, itemName: "Changed", quantity: 3 }), empty);
  assert.deepEqual(mergeSuggestion(emptyDetails, { ...suggestion, category: null, itemName: "", notes: "Gunakan foto satu jenis barang." }), emptyDetails);
});

function submission(overrides = {}) {
  const form = new FormData();
  for (const [key, value] of Object.entries({ ...emptyDetails, submissionId: "12345678-1234-4123-8123-123456789012", category: "phones", condition: "damaged", itemName: "Ponsel", quantity: "1", confirmed: "yes", ...overrides })) form.set(key, value);
  return form;
}

test("manual submissions work without AI, brand or known weight", () => {
  const parsed = parseSubmission(submission({ weightKg: "99", owner_id: "forged", status: "approved" }));
  assert.equal(parsed.weight_kg, null);
  assert.equal(parsed.brand_model, "");
  assert.equal(parsed.quantity, 1);
  assert.equal(parsed.owner_id, undefined);
  assert.equal(parsed.status, undefined);
  assert.equal(parseSubmission(submission({ weightKind: "actual", weightKg: "0.2" })).weight_kg, 0.2);
  assert.equal(parseSubmission(submission({ weightKind: "estimate", weightMinKg: "0.1", weightMaxKg: "0.3" })).weight_max_kg, 0.3);
});

test("rejects missing manual confirmation, condition, invalid weights and oversized fields", () => {
  for (const overrides of [{ confirmed: "no" }, { condition: "" }, { category: "toString" }, { submissionId: "bad" },
    { quantity: "1.5" }, { quantity: "101" }, { itemName: " " }, { brandModel: "x".repeat(161) },
    { weightKind: "actual", weightKg: "NaN" }, { weightKind: "actual", weightKg: "" },
    { weightKind: "estimate", weightMinKg: "3", weightMaxKg: "2" }, { weightKind: "measured" }]) assert.throws(() => parseSubmission(submission(overrides)));
});

test("limits attempts per user and expires the window", () => {
  const start = Date.now();
  for (let i = 0; i < 5; i++) assert.equal(takeAssessmentSlot("user-a", start), true);
  assert.equal(takeAssessmentSlot("user-a", start), false);
  assert.equal(takeAssessmentSlot("user-b", start), true);
  assert.equal(takeAssessmentSlot("user-a", start + 600_000), true);
});

test("decodes PNG, shrinks it and strips metadata", async () => {
  const input = await sharp({ create: { width: 2000, height: 1000, channels: 3, background: "green" } })
    .withMetadata().png().toBuffer();
  const result = await normalizeImage(input);
  const meta = await sharp(result).metadata();
  assert.equal(meta.format, "jpeg");
  assert.equal(meta.width, 1600);
  assert.equal(meta.height, 800);
  assert.equal(meta.exif, undefined);
});

test("rejects corrupt bytes and decodable unsupported formats", async () => {
  await assert.rejects(normalizeImage(Buffer.from("not an image")));
  const webp = await sharp({ create: { width: 8, height: 8, channels: 3, background: "green" } }).webp().toBuffer();
  await assert.rejects(normalizeImage(webp));
});
