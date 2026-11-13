import { supabase } from "@/lib/supabase";
import type { RegisterPayload } from "../interfaces/register-payload.interface";
import type { RegisterResult } from "../interfaces/register-result.interface";

export async function registerAction(payload: RegisterPayload): Promise<RegisterResult> {
  try {
    const name = payload.name.trim();
    const email = payload.email.trim();
    const password = payload.password;

    if (!name || !email || !password) {
      return {
        success: false,
        error: "Semua kolom wajib diisi.",
      };
    }

    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);

    if (!hasMinLength || !hasUpperCase || !hasNumber || !hasSymbol) {
      return {
        success: false,
        error:
          "Kata sandi harus minimal 8 karakter serta mengandung huruf besar, angka, dan simbol.",
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback`
            : undefined,
      },
    });

    if (error) {
      const alreadyRegistered =
        error.code === "user_already_exists" ||
        /already (been )?registered|already exists/i.test(error.message);

      if (alreadyRegistered) {
        return {
          success: false,
          alreadyRegistered: true,
          error: "Akun sudah terdaftar. Silakan masuk ke akun Anda.",
        };
      }

      if (error.status === 429 || /rate limit|too many/i.test(error.message)) {
        return {
          success: false,
          error: "Terlalu banyak permintaan pendaftaran. Silakan tunggu beberapa saat.",
        };
      }

      return {
        success: false,
        error: "Pendaftaran gagal. Periksa data lalu coba lagi.",
      };
    }

    if (data.user?.identities?.length === 0) {
      return {
        success: false,
        alreadyRegistered: true,
        error: "Akun sudah terdaftar. Silakan masuk ke akun Anda.",
      };
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
      error: "Tidak dapat terhubung ke server. Silakan coba lagi.",
    };
  }
}
