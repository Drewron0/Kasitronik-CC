import "server-only";
import type { Geocoder } from "@/app/location/interfaces/geocoder.interface";
import { createGeoapifyGeocoder } from "./geoapify-geocoder";

export function getGeocoder(): Geocoder {
  const key = process.env.GEOAPIFY_API_KEY;
  if (!key) throw new Error("Pencarian alamat belum dikonfigurasi. Hubungi pengelola atau pilih titik pada peta.");
  return createGeoapifyGeocoder(key);
}
