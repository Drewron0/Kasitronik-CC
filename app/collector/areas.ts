import type { CollectorArea } from "../../lib/collector/interfaces/collector-area.interface.ts";
import { MAX_AREAS, RADIUS_MAX_KM, RADIUS_MIN_KM } from "../../lib/collector/rules.ts";
import type { AreasValidation } from "./interfaces/areas-validation.type.ts";

const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

/** Validates collector areas from an untrusted client and clamps each radius to the allowed range. */
export function validateAreas(input: unknown): AreasValidation {
  if (!Array.isArray(input) || input.length === 0) return { ok: false, error: "Tambahkan minimal satu wilayah." };
  if (input.length > MAX_AREAS) return { ok: false, error: `Maksimal ${MAX_AREAS} wilayah.` };
  const areas: CollectorArea[] = [];
  for (const raw of input) {
    const area = raw as Record<string, unknown>;
    if (!area || !finite(area.latitude) || !finite(area.longitude) || !finite(area.radiusKm)
      || Math.abs(area.latitude) > 90 || Math.abs(area.longitude) > 180) {
      return { ok: false, error: "Titik wilayah tidak valid." };
    }
    areas.push({ latitude: area.latitude, longitude: area.longitude, radiusKm: Math.min(RADIUS_MAX_KM, Math.max(RADIUS_MIN_KM, area.radiusKm)) });
  }
  return { ok: true, areas };
}
