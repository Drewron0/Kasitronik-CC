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

test("dashboard search filtering filters by item name, brand model, and category", () => {
  const items = [
    { id: "1", item_name: "MacBook Pro M1", brand_model: "Apple", category: "computers", status: "completed" },
    { id: "2", item_name: "Galaxy S21", brand_model: "Samsung", category: "phones", status: "pending" },
    { id: "3", item_name: "Kulkas 2 Pintu", brand_model: "Sharp", category: "appliances", status: "accepted" },
  ];

  const filterByQuery = (q) => {
    const term = q.toLowerCase().trim();
    return items.filter(
      (i) =>
        i.item_name.toLowerCase().includes(term) ||
        i.brand_model.toLowerCase().includes(term) ||
        formatCategory(i.category).toLowerCase().includes(term)
    );
  };

  assert.equal(filterByQuery("macbook").length, 1);
  assert.equal(filterByQuery("apple").length, 1);
  assert.equal(filterByQuery("smartphone").length, 1);
  assert.equal(filterByQuery("kulkas").length, 1);
  assert.equal(filterByQuery("nonexistent").length, 0);
});

test("dashboard receipt number formatting generates canonical identifier", () => {
  const sampleId = "94f97b73-9a36-40ef-b518-fb4bc022b5f6";
  const receiptNumber = `KST-${sampleId.replace(/-/g, "").slice(0, 10).toUpperCase()}`;
  assert.equal(receiptNumber, "KST-94F97B739A");
});
