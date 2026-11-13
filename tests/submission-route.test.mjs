import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import { parseSubmission } from "../app/reports/item-details.ts";
import { parsePickupLocation } from "../app/location/location.ts";

const source = await readFile(new URL("../app/api/reports/route.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const id = "12345678-1234-4123-8123-123456789012";
const ownerId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function setup({ existing = false, uploadError = null, insertError = null, preflightError = null, appearedAfterInsert = false } = {}) {
  const calls = { uploads: [], inserts: [], removals: [] };
  let reads = 0;
  const form = new FormData();
  for (const [key, value] of Object.entries({ pickupLatitude: "-7.25", pickupLongitude: "112.75", pickupAddress: "Alamat pengujian", pickupInstructions: "Gerbang depan", locationConfirmed: "yes" })) form.set(key, value);
  for (const [key, value] of Object.entries({ submissionId: id, category: "phones", itemName: "Ponsel", condition: "dead", quantity: "1", weightKind: "unknown", confirmed: "yes", owner_id: "forged", status: "approved" })) form.set(key, value);
  const client = {
    from(table) {
      assert.equal(table, "item_submissions");
      return {
        select: () => ({ eq: (column, value) => {
          assert.equal(column, "id"); assert.equal(value, id);
          return { maybeSingle: async () => ({ data: existing || reads++ > 0 && appearedAfterInsert ? { id } : null, error: preflightError }) };
        } }),
        insert: async row => { calls.inserts.push(row); return { error: insertError }; },
      };
    },
    storage: { from(bucket) {
      assert.equal(bucket, "submission-photos");
      return {
        upload: async (path, image, options) => { calls.uploads.push({ path, image, options }); return { error: uploadError }; },
        remove: async paths => { calls.removals.push(paths); return { error: null }; },
      };
    } },
  };
  const exports = {};
  const dependencies = {
    "@/app/reports/item-details": { parseSubmission },
    "@/app/location/location": { parsePickupLocation },
    "@/lib/reports/request": {
      readReportRequest: async () => ({ client, ownerId, form, image: Buffer.from("normalized JPEG") }),
      failure: (error, status) => Response.json({ error }, { status }),
    },
  };
  new Function("require", "exports", compiled)(name => dependencies[name], exports);
  return { calls, run: () => exports.POST(new Request("http://localhost/api/reports", { method: "POST" })) };
}

test("submission stores normalized photo and authenticated owner with pending status", async () => {
  const { calls, run } = setup();
  const response = await run();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { id, status: "pending" });
  assert.equal(calls.inserts[0].owner_id, ownerId);
  assert.equal(calls.inserts[0].status, "pending");
  assert.equal(calls.inserts[0].pickup_latitude, -7.25);
  assert.equal(calls.inserts[0].pickup_longitude, 112.75);
  assert.equal(calls.inserts[0].photo_path, `${ownerId}/${id}/photo.jpg`);
  assert.deepEqual(calls.uploads[0].options, { contentType: "image/jpeg", upsert: false });
  assert.equal(calls.removals.length, 0);
});

test("completed retry returns original ID without another upload or insert", async () => {
  const { calls, run } = setup({ existing: true });
  assert.equal((await run()).status, 200);
  assert.equal(calls.uploads.length, 0);
  assert.equal(calls.inserts.length, 0);
});

test("retry reuses existing photo and recognizes an insert whose response was lost", async () => {
  const { calls, run } = setup({ uploadError: { statusCode: "409" }, insertError: { code: "NETWORK" }, appearedAfterInsert: true });
  assert.equal((await run()).status, 200);
  assert.equal(calls.inserts.length, 1);
  assert.equal(calls.removals.length, 0);
});

test("retains photos after ambiguous errors but cleans up known rejected inserts", async () => {
  for (const [code, expectedRemovals] of [["NETWORK", 0], ["23514", 1]]) {
    const { calls, run } = setup({ insertError: { code } });
    assert.equal((await run()).status, 503);
    assert.equal(calls.removals.length, expectedRemovals);
  }
});

test("missing schema or failed upload never inserts a row", async () => {
  for (const options of [{ preflightError: { code: "PGRST205" } }, { uploadError: { statusCode: "500" } }]) {
    const { calls, run } = setup(options);
    assert.equal((await run()).status, 503);
    assert.equal(calls.inserts.length, 0);
  }
});
