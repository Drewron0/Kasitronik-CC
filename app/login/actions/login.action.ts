import { supabase } from "@/lib/supabase";
import type { LoginPayload } from "../interfaces/login-payload.interface";
import type { LoginResult } from "../interfaces/login-result.interface";

export async function loginAction(payload: LoginPayload): Promise<LoginResult> {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });

    if (error) {
      return {
        success: false,
        error:
          error.code === "email_not_confirmed"
            ? "Konfirmasi email terlebih dahulu sebelum masuk."
            : "Login gagal. Periksa email dan kata sandi, lalu coba lagi.",
      };
    }

    return { success: true };
  } catch {
    return {
      success: false,
      error: "Tidak dapat menghubungi server. Coba lagi.",
    };
  }
}
