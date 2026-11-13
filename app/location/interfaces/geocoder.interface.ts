import type { AddressResult } from "./address-result.interface";

export interface Geocoder {
  searchAddress(query: string, signal?: AbortSignal): Promise<AddressResult[]>;
}
