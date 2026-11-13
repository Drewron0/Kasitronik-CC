import { supabase } from "@/lib/supabase";
import type { LoginPayload } from "../interfaces/login-payload.interface";
import type { LoginResult } from "../interfaces/login-result.interface";

export async function loginAction(payload: LoginPayload): Promise<LoginResult> {
  try {
    const email = payload.email.trim();
    const password = payload.password;

    if (!email || !password) {
      return {
        success: false,
        error: "Email dan kata sandi wajib diisi.",
      };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const code = error.code || "";
      const msg = error.message || "";

      if (code === "email_not_confirmed" || /email.*confirm/i.test(msg)) {
        return {
          success: false,
          error: "Email belum diverifikasi. Silakan periksa kotak masuk email Anda terlebih dahulu.",
        };
      }

      if (
        code === "invalid_credentials" ||
        /invalid (login )?credentials/i.test(msg) ||
        code === "user_not_found"
      ) {
        return {
          success: false,
          error: "Email atau kata sandi tidak cocok. Silakan coba lagi.",
        };
      }

      if (
        code === "over_request_rate_limit" ||
        /rate limit|too many requests/i.test(msg) ||
        error.status === 429
      ) {
        return {
          success: false,
          error: "Terlalu banyak percobaan masuk. Silakan tunggu beberapa saat.",
        };
      }

      return {
        success: false,
        error: "Gagal masuk. Periksa kembali data Anda dan coba lagi.",
      };
    }

    return { success: true };
  } catch {
    return {
      success: false,
      error: "Tidak dapat terhubung ke server. Silakan coba lagi.",
    };
  }
}
