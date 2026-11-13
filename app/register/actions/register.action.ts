import { supabase } from "@/lib/supabase";
import type { RegisterPayload } from "../interfaces/register-payload.interface";
import type { RegisterResult } from "../interfaces/register-result.interface";

export async function registerAction(payload: RegisterPayload): Promise<RegisterResult> {
  try {
    const hasMinLength = payload.password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(payload.password);
    const hasNumber = /[0-9]/.test(payload.password);
    const hasSymbol = /[^A-Za-z0-9]/.test(payload.password);

    if (!hasMinLength || !hasUpperCase || !hasNumber || !hasSymbol) {
      return {
        success: false,
        error:
          "Kata sandi harus minimal 8 karakter serta mengandung huruf besar, angka, dan simbol.",
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          full_name: payload.name,
        },
        emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
      },
    });

    if (error) {
      const alreadyRegistered = error.code === "user_already_exists" || /already (been )?registered|already exists/i.test(error.message);
      return {
        success: false,
        alreadyRegistered,
        error: alreadyRegistered ? "Email ini sudah terdaftar. Masuk atau verifikasi akun yang sudah ada." : "Pendaftaran gagal. Periksa data lalu coba lagi.",
      };
    }

    if (data.user?.identities?.length === 0) {
      return { success: false, alreadyRegistered: true, error: "Email ini sudah terdaftar. Masuk atau verifikasi akun yang sudah ada." };
    }

    return {
      success: true,
      message: data.session
        ? "Akun berhasil dibuat dan sesi login sudah aktif."
        : "Periksa email untuk konfirmasi pendaftaran akun Anda.",
    };
  } catch {
    return {
      success: false,
      error: "Tidak dapat menghubungi server. Coba lagi.",
    };
  }
}
