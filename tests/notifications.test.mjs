import { test } from "node:test";
import assert from "node:assert/strict";
import { adminAlertEmail, cancelledPush, digestPush, offerPush, ownerClaimedEmail, ownerDoneEmail, ownerReleasedEmail } from "../lib/notifications/messages.ts";
import { getNotifier } from "../lib/notifications/get-notifier.ts";
import { createMemoryStore } from "./helpers/memory-store.mjs";
import { collector, submission } from "./helpers/fixtures.mjs";

const sub = submission();

test("offer push hides address and phone", () => {
  const payload = offerPush(sub, 2.14, "https://kasitronik.test/j/abc");
  const text = `${payload.title} ${payload.body}`;
  assert.doesNotMatch(text, /Banjarsari/);
  assert.doesNotMatch(text, /6281234567890|0812/);
  assert.match(text, /Tembalang/);
  assert.match(text, /2,1 km/);
  assert.equal(payload.url, "https://kasitronik.test/j/abc");
  assert.equal(payload.tag, "offer-sub-1");
});

test("offer push without district still reads", () => {
  assert.match(offerPush(submission({ district: "" }), 0.5, "u").title, /^Laporan baru/);
});

test("owner claimed email contains code and collector", () => {
  const mail = ownerClaimedEmail("warga@example.com", sub, collector("c1", { name: "Budi" }), 4.5, "https://kasitronik.test");
  assert.equal(mail.to, "warga@example.com");
  assert.match(mail.text, /Budi/);
  assert.match(mail.text, /0811-1111-1111/);
  assert.match(mail.text, /0427/);
  assert.match(mail.text, /4,5/);
  assert.match(mail.text, /https:\/\/kasitronik\.test\/dashboard/);
});

test("owner done email shows price or free", () => {
  assert.match(ownerDoneEmail("w@example.com", sub, 150000, "https://k.test").text, /Rp 150\.000/);
  assert.match(ownerDoneEmail("w@example.com", sub, null, "https://k.test").text, /gratis/i);
});

test("messages are ASCII only", () => {
  const all = [
    offerPush(sub, 2, "u"), digestPush(3, "u"), cancelledPush(sub, "u"),
    ownerClaimedEmail("a@b.c", sub, collector("c1"), null, "u"), ownerReleasedEmail("a@b.c", sub, "u"),
    ownerDoneEmail("a@b.c", sub, 1000, "u"), adminAlertEmail("a@b.c", "unclaimed", sub),
    adminAlertEmail("a@b.c", "problem", sub, "Pengepul tidak datang"),
  ];
  for (const message of all) {
    for (const value of Object.values(message)) {
      if (typeof value === "string") assert.match(value, /^[\x20-\x7E\n]*$/, value);
    }
  }
});

test("console notifier is used when env is empty", async () => {
  const notifier = getNotifier({});
  const original = console.info;
  console.info = () => {};
  try {
    assert.deepEqual(await notifier.push({ endpoint: "e", p256dh: "p", auth: "a" }, digestPush(1, "u")), { ok: true });
    assert.deepEqual(await notifier.email({ to: "a@b.c", subject: "s", text: "t" }), { ok: true });
  } finally {
    console.info = original;
  }
});

test("memory store conditional update", async () => {
  const store = createMemoryStore({ submissions: [sub] });
  assert.equal(await store.updateSubmissionIf("sub-1", { status: "pending", collectorId: null }, { status: "accepted", collector_id: "c1" }), true);
  assert.equal(await store.updateSubmissionIf("sub-1", { status: "pending", collectorId: null }, { status: "accepted", collector_id: "c2" }), false);
  assert.equal((await store.getSubmission("sub-1")).collectorId, "c1");
});
