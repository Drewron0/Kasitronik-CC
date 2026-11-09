import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import { isAddressResult, isCoordinates, parsePickupLocation } from "../app/location/location.ts";
import { takeSearchSlot } from "../lib/location/search-limit.ts";

test("coordinates keep latitude/longitude order and reject missing or invalid numbers", () => {
  assert.equal(isCoordinates({ latitude: -7.25, longitude: 112.75 }), true);
  for (const point of [null, {}, { latitude: 112.75, longitude: -7.25 }, { latitude: 0, longitude: Infinity }, { latitude: "0", longitude: 0 }, { latitude: NaN, longitude: 0 }]) assert.equal(isCoordinates(point), false);
});

function form(overrides = {}) {
  const result = new FormData();
  for (const [key, value] of Object.entries({ pickupLatitude: "-7.25", pickupLongitude: "112.75", pickupAddress: "Jalan pengujian 1", pickupInstructions: "", locationConfirmed: "yes", ...overrides })) result.set(key, value);
  return result;
}

test("pickup requires confirmed pin and written address; zero coordinates remain valid", () => {
  assert.equal(parsePickupLocation(form()).pickup_longitude, 112.75);
  assert.equal(parsePickupLocation(form({ pickupLatitude: "0", pickupLongitude: "0" })).pickup_latitude, 0);
  for (const fields of [{ pickupLatitude: "" }, { pickupLongitude: " " }, { pickupLatitude: "NaN" }, { pickupLongitude: "181" }, { pickupAddress: "    " }, { pickupInstructions: "x".repeat(501) }, { locationConfirmed: "no" }]) assert.throws(() => parsePickupLocation(form(fields)));
});

test("Geoapify adapter returns provider-neutral results and forwards cancellation", async () => {
  const source = await readFile(new URL("../lib/location/geoapify-geocoder.ts", import.meta.url), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  new Function("require", "exports", code)(() => ({ isAddressResult }), exports);
  const abort = new AbortController();
  const service = exports.createGeoapifyGeocoder("test-key", async (url, options) => {
    assert.equal(url.origin, "https://api.geoapify.com");
    assert.equal(url.searchParams.get("text"), "Surabaya & jalan");
    assert.equal(url.searchParams.get("filter"), "countrycode:id");
    assert.equal(options.cache, "no-store");
    abort.abort();
    assert.equal(options.signal.aborted, true);
    return Response.json({ results: [{ formatted: "Surabaya", lat: -7.25, lon: 112.75, privateProviderField: "ignored" }, { formatted: "invalid", lat: 200, lon: 1 }] });
  });
  assert.deepEqual(await service.searchAddress("Surabaya & jalan", abort.signal), [{ label: "Surabaya", coordinates: { latitude: -7.25, longitude: 112.75 } }]);
  await assert.rejects(exports.createGeoapifyGeocoder("test", async () => Response.json({}, { status: 429 })).searchAddress("Surabaya"));
  await assert.rejects(exports.createGeoapifyGeocoder("test", async () => Response.json({})).searchAddress("Surabaya"));
});

test("search limiter restricts provider bursts and user allowance", () => {
  const now = Date.now();
  for (let i = 0; i < 4; i++) assert.equal(takeSearchSlot(`burst-${i}`, now), true);
  assert.equal(takeSearchSlot("fifth", now), false);
  for (let i = 0; i < 30; i++) assert.equal(takeSearchSlot("frequent", now + (i + 1) * 1000), true);
  assert.equal(takeSearchSlot("frequent", now + 32_000), false);
  assert.equal(takeSearchSlot("frequent", now + 61_000), true);
});
