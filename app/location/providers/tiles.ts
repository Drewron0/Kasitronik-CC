import type { TileSource } from "../interfaces/tile-source.interface";

export function getTileSource(): TileSource | null {
  const key = process.env.NEXT_PUBLIC_GEOAPIFY_MAPS_KEY;
  if (!key) return null;
  return {
    url: `https://maps.geoapify.com/v1/tile/osm-carto/{z}/{x}/{y}.png?apiKey=${encodeURIComponent(key)}`,
    attribution: '<a href="https://www.geoapify.com/">Powered by Geoapify</a> | <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    maxZoom: 19,
  };
}
