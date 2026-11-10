import { supabase } from "@/lib/supabase";
import type { VerifyOtpPayload } from "../interfaces/verify-otp-payload.interface";
import type { VerifyOtpResult } from "../interfaces/verify-otp-result.interface";

export async function verifyOtpAction(payload: VerifyOtpPayload): Promise<VerifyOtpResult> {
  const { email, token, type = "email" } = payload;

  if (!email || !token) {
    return { success: false, error: "Email dan kode OTP wajib diisi." };
  }

  try {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: type as "email" | "signup" | "magiclink",
    });

    if (error) {
      // Map standard Supabase error messages to friendly Indonesian
      let userError = error.message;
      if (error.message.includes("Token has expired")) {
        userError = "Kode OTP sudah kedaluwarsa. Silakan minta kode baru.";
      } else if (error.message.includes("Token is invalid")) {
        userError = "Kode OTP tidak valid. Periksa kembali angka yang dimasukkan.";
      }
      return { success: false, error: userError };
    }

    return { success: true, message: "Verifikasi berhasil! Mengalihkan..." };
  } catch {
    return { success: false, error: "Gagal memproses verifikasi. Coba beberapa saat lagi." };
  }
}
