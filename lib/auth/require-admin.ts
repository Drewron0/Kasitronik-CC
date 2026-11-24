import "server-only";
import { createClient } from "@supabase/supabase-js";
import { isAdminUser } from "./is-admin";

const json = (body: unknown, status: number) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

/** Returns null for a signed-in admin, or the 401/403 response to send instead. */
export async function requireAdmin(request: Request): Promise<Response | null> {
  const token = request.headers.get("authorization")?.match(/^Bearer (\S+)$/i)?.[1];
  if (!token) return json({ error: "Masuk terlebih dahulu." }, 401);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return json({ error: "Supabase belum dikonfigurasi." }, 503);
  try {
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) return json({ error: "Sesi berakhir. Silakan masuk kembali." }, 401);
    return isAdminUser(data.user) ? null : json({ error: "Halaman ini khusus admin." }, 403);
  } catch {
    return json({ error: "Tidak dapat memverifikasi akun." }, 503);
  }
}
