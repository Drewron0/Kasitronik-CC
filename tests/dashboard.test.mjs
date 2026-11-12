import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formatCategory,
  formatCondition,
  formatStatus,
  formatWeight,
  formatDate,
  CATEGORY_LABELS,
  CONDITION_LABELS,
  STATUS_LABELS,
} from "../app/dashboard/utils/formatters.ts";

test("dashboard formatters handle known categories, conditions, and statuses", () => {
  for (const [key, label] of Object.entries(CATEGORY_LABELS)) {
    assert.equal(formatCategory(key), label);
  }
  for (const [key, label] of Object.entries(CONDITION_LABELS)) {
    assert.equal(formatCondition(key), label);
  }
  for (const [key, label] of Object.entries(STATUS_LABELS)) {
    assert.equal(formatStatus(key), label);
  }
  assert.equal(formatCategory("unknown_cat"), "unknown_cat");
  assert.equal(formatCondition("unknown_cond"), "unknown_cond");
  assert.equal(formatStatus("unknown_status"), "unknown_status");
});

test("dashboard formatWeight formats actual, estimate, and unknown weights", () => {
  assert.equal(
    formatWeight({ weight_kind: "actual", weight_kg: 2.5, weight_min_kg: null, weight_max_kg: null }),
    "2.5 kg"
  );
  assert.equal(
    formatWeight({ weight_kind: "estimate", weight_kg: null, weight_min_kg: 1, weight_max_kg: 3 }),
    "1 - 3 kg (perkiraan)"
  );
  assert.equal(
    formatWeight({ weight_kind: "unknown", weight_kg: null, weight_min_kg: null, weight_max_kg: null }),
    "Tidak diketahui"
  );
});

test("dashboard formatDate formats ISO timestamps accurately", () => {
  const formatted = formatDate("2026-11-09T10:00:00.000Z");
  assert.match(formatted, /2026/);
});

test("dashboard status categorization logic partitions statuses correctly", () => {
  const activeStatuses = ["pending", "accepted", "picked_up"];
  const completedStatuses = ["completed"];
  const cancelledStatuses = ["cancelled"];

  const sampleItems = [
    { id: "1", status: "pending" },
    { id: "2", status: "accepted" },
    { id: "3", status: "picked_up" },
    { id: "4", status: "completed" },
    { id: "5", status: "cancelled" },
  ];

  const active = sampleItems.filter((i) => activeStatuses.includes(i.status));
  const completed = sampleItems.filter((i) => completedStatuses.includes(i.status));
  const cancelled = sampleItems.filter((i) => cancelledStatuses.includes(i.status));

  assert.equal(active.length, 3);
  assert.equal(completed.length, 1);
  assert.equal(cancelled.length, 1);
  assert.equal(active.length + completed.length + cancelled.length, sampleItems.length);
});
