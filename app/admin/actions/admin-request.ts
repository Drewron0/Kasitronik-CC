import { supabase } from "@/lib/supabase";
import type { AdminResponse } from "../interfaces/admin-response.type";

/** Calls an admin API route with the signed-in session. */
export async function adminRequest<T>(path: string, method: "GET" | "POST" | "PATCH" = "GET", body?: unknown): Promise<AdminResponse<T>> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return { ok: false, status: 401, error: "Masuk terlebih dahulu." };
  try {
    const response = await fetch(path, {
      method,
      headers: { Authorization: `Bearer ${data.session.access_token}`, ...(body === undefined ? {} : { "Content-Type": "application/json" }) },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(20_000),
    });
    const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (response.ok) return { ok: true, data: payload as T };
    const field = payload.field === "name" || payload.field === "phone" || payload.field === "areas" ? payload.field : undefined;
    return { ok: false, status: response.status, error: typeof payload.error === "string" ? payload.error : "Permintaan gagal.", field };
  } catch {
    return { ok: false, status: 0, error: "Tidak dapat terhubung ke server." };
  }
}
