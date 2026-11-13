import { supabase } from "@/lib/supabase";
import { isAddressResult } from "../location";
import type { Geocoder } from "../interfaces/geocoder.interface";

export const addressSearch: Geocoder = {
  async searchAddress(query, signal) {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) throw new Error("Masuk terlebih dahulu untuk mencari alamat.");
    const response = await fetch("/api/location/search", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session.access_token}` },
      body: JSON.stringify({ query }), signal,
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : "Pencarian belum berhasil.");
    if (!Array.isArray(payload.results) || !payload.results.every(isAddressResult)) throw new Error("Hasil pencarian tidak valid.");
    return payload.results;
  },
};
