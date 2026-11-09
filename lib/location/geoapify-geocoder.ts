import type { Geocoder } from "@/app/location/interfaces/geocoder.interface";
import type { AddressResult } from "@/app/location/interfaces/address-result.interface";
import { isAddressResult } from "@/app/location/location";

export function createGeoapifyGeocoder(apiKey: string, request: typeof fetch = fetch): Geocoder {
  return {
    async searchAddress(query, signal) {
      const url = new URL("https://api.geoapify.com/v1/geocode/autocomplete");
      url.search = new URLSearchParams({ text: query, filter: "countrycode:id", lang: "id", limit: "5", format: "json", apiKey }).toString();
      const response = await request(url, { signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(10_000)]) : AbortSignal.timeout(10_000), cache: "no-store" });
      if (!response.ok) throw new Error("Pencarian alamat sedang tidak tersedia. Pilih titik pada peta atau coba lagi.");
      const payload: unknown = await response.json();
      if (!payload || typeof payload !== "object" || !("results" in payload) || !Array.isArray(payload.results)) throw new Error("Respons pencarian tidak dapat dibaca.");
      const results: AddressResult[] = [];
      for (const entry of payload.results.slice(0, 5)) {
        if (!entry || typeof entry !== "object") continue;
        const result = { label: entry.formatted, coordinates: { latitude: entry.lat, longitude: entry.lon } };
        if (isAddressResult(result)) results.push(result);
      }
      return results;
    },
  };
}
