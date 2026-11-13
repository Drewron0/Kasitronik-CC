import { test } from "node:test";
import assert from "node:assert/strict";
import { aiErrorResponse } from "../lib/ai/error-response.ts";

test("Gemini failures produce distinct safe messages and appropriate HTTP statuses", () => {
  for (const [providerStatus, httpStatus, text] of [
    [429, 429, "kuota"], [503, 503, "sibuk"],
    [500, 502, "gangguan"], [502, 502, "gangguan"],
    [504, 504, "terlalu lama"], [408, 504, "terlalu lama"],
    [401, 503, "Akses"], [403, 503, "Akses"],
    [404, 503, "Model"], [400, 502, "menolak"], [422, 502, "menolak"],
  ]) {
    const result = aiErrorResponse({ status: providerStatus, message: "SECRET_API_KEY" });
    assert.equal(result.status, httpStatus);
    assert.ok(result.error.includes(text));
    assert.ok(!result.error.includes("SECRET_API_KEY"));
  }
  for (const name of ["AbortError", "TimeoutError"]) {
    assert.equal(aiErrorResponse(Object.assign(new Error("secret"), { name })).status, 504);
  }
  for (const cause of [null, undefined, "secret", new Error("secret"), { status: 999 }]) {
    assert.equal(aiErrorResponse(cause).status, 502);
    assert.ok(!aiErrorResponse(cause).error.includes("secret"));
  }
});
