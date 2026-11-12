import type { SubmissionItem } from "../interfaces/submission-item.interface";
import type { SubmissionStatus } from "../interfaces/submission-status.type";

export const CATEGORY_LABELS: Record<string, string> = {
  computers: "Komputer & Laptop",
  phones: "Smartphone",
  appliances: "Alat Rumah Tangga",
  displays: "TV & Monitor",
  components: "Komponen",
};

export const CONDITION_LABELS: Record<string, string> = {
  working: "Normal / Berfungsi",
  damaged: "Rusak Sebagian",
  dead: "Mati Total",
  dismantled: "Rongsok / Dipreteli",
};

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending: "Diumumkan",
  accepted: "Diterima",
  picked_up: "Diambil",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export function formatCategory(category: string): string {
  return CATEGORY_LABELS[category] || category;
}

export function formatCondition(condition: string): string {
  return CONDITION_LABELS[condition] || condition;
}

export function formatStatus(status: SubmissionStatus): string {
  return STATUS_LABELS[status] || status;
}

export function formatWeight(
  item: Pick<SubmissionItem, "weight_kind" | "weight_kg" | "weight_min_kg" | "weight_max_kg">
): string {
  if (item.weight_kind === "actual" && item.weight_kg !== null) {
    return `${item.weight_kg} kg`;
  }
  if (
    item.weight_kind === "estimate" &&
    item.weight_min_kg !== null &&
    item.weight_max_kg !== null
  ) {
    return `${item.weight_min_kg} - ${item.weight_max_kg} kg (perkiraan)`;
  }
  return "Tidak diketahui";
}

export function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return isoDate;
  }
}
