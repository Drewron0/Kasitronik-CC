import type { Coordinates } from "../../app/location/interfaces/coordinates.interface.ts";

/** Names the district of a point for collector messages. Any failure yields "" so a report is never blocked. */
export async function reverseDistrict(apiKey: string, point: Coordinates, request: typeof fetch = fetch): Promise<string> {
  if (!apiKey) return "";
  try {
    const url = new URL("https://api.geoapify.com/v1/geocode/reverse");
    url.search = new URLSearchParams({ lat: String(point.latitude), lon: String(point.longitude), lang: "id", format: "json", apiKey }).toString();
    const response = await request(url, { signal: AbortSignal.timeout(5_000), cache: "no-store" });
    if (!response.ok) return "";
    const payload = (await response.json()) as { results?: Record<string, unknown>[] };
    const first = payload.results?.[0] ?? {};
    const name = [first.suburb, first.district, first.city].find(value => typeof value === "string" && value.trim());
    return typeof name === "string" ? name.trim().slice(0, 120) : "";
  } catch {
    return "";
  }
}
