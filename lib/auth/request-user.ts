import "server-only";
import { createClient } from "@supabase/supabase-js";

export async function requestUser(request: Request) {
  const token = request.headers.get("authorization")?.match(/^Bearer (\S+)$/i)?.[1];
  if (!token) return { error: "Masuk terlebih dahulu untuk melanjutkan.", status: 401 };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return { error: "Supabase belum dikonfigurasi. Hubungi pengelola.", status: 503 };
  try {
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` }, fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(20_000) }) },
    });
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) return { error: "Sesi berakhir. Silakan masuk kembali.", status: 401 };
    return { client, ownerId: data.user.id };
  } catch { return { error: "Tidak dapat memverifikasi akun. Coba lagi.", status: 503 }; }
}
