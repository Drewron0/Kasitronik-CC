import type { ItemDetails } from "./interfaces/item-details.interface";
import type { ItemSuggestion } from "./interfaces/item-suggestion.interface";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const categories = {
  computers: "Komputer & Laptop", phones: "Smartphone & Tablet",
  appliances: "Perangkat Rumah Tangga Besar / AC / Kulkas",
  displays: "TV & Monitor", components: "Komponen / Kabel / Lainnya",
};
export const conditions = {
  working: "Masih nyala normal", damaged: "Rusak sebagian / minus",
  dead: "Mati total (matot)", dismantled: "Sudah dipreteli / rongsok komponen",
};
export const emptyDetails: ItemDetails = {
  category: "", itemName: "", brandModel: "", quantity: "", condition: "", notes: "",
  weightKind: "unknown", weightKg: "", weightMinKg: "", weightMaxKg: "",
};
const validKg = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value > 0 && value <= 1000;

export function isSuggestion(value: unknown): value is ItemSuggestion {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (v.category === null || typeof v.category === "string" && Object.hasOwn(categories, v.category))
    && typeof v.itemName === "string" && v.itemName.length <= 120
    && typeof v.brandModel === "string" && v.brandModel.length <= 160
    && typeof v.notes === "string" && v.notes.length <= 2000
    && (v.quantity === null || typeof v.quantity === "number" && Number.isInteger(v.quantity) && v.quantity >= 1 && v.quantity <= 100)
    && (v.weightMinKg === null && v.weightMaxKg === null || validKg(v.weightMinKg) && validKg(v.weightMaxKg) && v.weightMinKg < v.weightMaxKg);
}

export function mergeSuggestion(details: ItemDetails, suggestion: ItemSuggestion): ItemDetails {
  const next = { ...details };
  if (!suggestion.category || !suggestion.itemName.trim()) return next;
  for (const key of ["category", "itemName", "brandModel", "notes"] as const) {
    if (!next[key].trim() && suggestion[key]) next[key] = suggestion[key];
  }
  if (!next.quantity && suggestion.quantity !== null) next.quantity = String(suggestion.quantity);
  if (next.weightKind === "unknown" && !next.weightKg && !next.weightMinKg && !next.weightMaxKg && suggestion.weightMinKg !== null) {
    next.weightKind = "estimate";
    next.weightMinKg = String(suggestion.weightMinKg);
    next.weightMaxKg = String(suggestion.weightMaxKg);
  }
  return next;
}

export function parseSubmission(form: FormData) {
  const get = (key: string) => typeof form.get(key) === "string" ? (form.get(key) as string).trim() : "";
  const id = get("submissionId");
  const category = get("category"), condition = get("condition");
  const item_name = get("itemName"), brand_model = get("brandModel"), notes = get("notes");
  const quantity = Number(get("quantity"));
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) throw new Error("ID kiriman tidak valid. Muat ulang halaman.");
  if (!Object.hasOwn(categories, category) || !Object.hasOwn(conditions, condition)) throw new Error("Pilih kategori dan kondisi barang.");
  if (!item_name || item_name.length > 120 || brand_model.length > 160 || notes.length > 2000) throw new Error("Periksa nama, merek, dan catatan barang.");
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) throw new Error("Jumlah barang harus 1 sampai 100 unit.");
  const weight_kind = get("weightKind");
  if (!["unknown", "actual", "estimate"].includes(weight_kind)) throw new Error("Pilih jenis berat.");
  const weight_kg = weight_kind === "actual" ? Number(get("weightKg")) : null;
  const weight_min_kg = weight_kind === "estimate" ? Number(get("weightMinKg")) : null;
  const weight_max_kg = weight_kind === "estimate" ? Number(get("weightMaxKg")) : null;
  if (weight_kind === "actual" && !validKg(weight_kg) || weight_kind === "estimate" && (!validKg(weight_min_kg) || !validKg(weight_max_kg) || weight_min_kg >= weight_max_kg)) throw new Error("Isi berat per unit dalam kg, lebih dari 0 hingga 1000. Batas atas harus lebih besar.");
  if (get("confirmed") !== "yes") throw new Error("Konfirmasi detail barang sebelum mengirim.");
  return { id, category, condition, item_name, brand_model, quantity, notes, weight_kind, weight_kg, weight_min_kg, weight_max_kg };
}
