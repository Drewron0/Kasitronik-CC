import { supabase } from "@/lib/supabase";

/** Calls an owner API route with the signed-in session; returns the route's message on failure. */
export async function ownerRequest(path: string, body?: unknown): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return { success: false, error: "Sesi telah berakhir. Silakan masuk kembali." };
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { Authorization: `Bearer ${data.session.access_token}`, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(20_000),
    });
    if (response.ok) return { success: true };
    const payload = (await response.json().catch(() => ({}))) as { error?: unknown };
    return { success: false, error: typeof payload.error === "string" ? payload.error : "Permintaan gagal. Coba lagi." };
  } catch {
    return { success: false, error: "Tidak dapat terhubung ke server. Coba lagi." };
  }
}
