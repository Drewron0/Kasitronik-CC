import type { Coordinates } from "./interfaces/coordinates.interface";
import type { AddressResult } from "./interfaces/address-result.interface";
import type { PickupLocation } from "./interfaces/pickup-location.interface";

export const emptyLocation: PickupLocation = { coordinates: null, address: "", instructions: "", confirmed: false };

export function isCoordinates(value: unknown): value is Coordinates {
  if (!value || typeof value !== "object") return false;
  const point = value as Record<string, unknown>;
  return typeof point.latitude === "number" && Number.isFinite(point.latitude) && Math.abs(point.latitude) <= 90
    && typeof point.longitude === "number" && Number.isFinite(point.longitude) && Math.abs(point.longitude) <= 180;
}

export function isAddressResult(value: unknown): value is AddressResult {
  if (!value || typeof value !== "object") return false;
  const result = value as Record<string, unknown>;
  return typeof result.label === "string" && result.label.trim().length > 0 && result.label.length <= 500 && isCoordinates(result.coordinates);
}

export function parsePickupLocation(form: FormData) {
  const get = (name: string) => typeof form.get(name) === "string" ? (form.get(name) as string).trim() : "";
  const latitude = get("pickupLatitude"), longitude = get("pickupLongitude");
  const point = { latitude: Number(latitude), longitude: Number(longitude) };
  if (!latitude || !longitude || !isCoordinates(point)) throw new Error("Pilih titik penjemputan pada peta.");
  const pickup_address = get("pickupAddress"), pickup_instructions = get("pickupInstructions");
  if (pickup_address.length < 5 || pickup_address.length > 500 || pickup_instructions.length > 500) throw new Error("Isi alamat penjemputan (5-500 karakter) dan patokan maksimal 500 karakter.");
  if (get("locationConfirmed") !== "yes") throw new Error("Konfirmasi titik penjemputan terlebih dahulu.");
  return { pickup_latitude: point.latitude, pickup_longitude: point.longitude, pickup_address, pickup_instructions };
}
