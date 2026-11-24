import type { Coordinates } from "../../app/location/interfaces/coordinates.interface.ts";
import type { CollectorArea } from "./interfaces/collector-area.interface.ts";

const EARTH_RADIUS_KM = 6371;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export function distanceKm(a: Coordinates, b: Coordinates): number {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLng = toRadians(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(a.latitude)) * Math.cos(toRadians(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function areaCovers(area: CollectorArea, point: Coordinates): boolean {
  return distanceKm(area, point) <= area.radiusKm;
}
