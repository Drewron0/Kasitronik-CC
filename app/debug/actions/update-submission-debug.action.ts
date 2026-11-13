import { supabase } from "@/lib/supabase";
import type {
  DebugUpdatePayload,
  DebugUpdateResult,
} from "../interfaces/debug-update-payload.interface";

export async function updateSubmissionDebugAction(
  payload: DebugUpdatePayload
): Promise<DebugUpdateResult> {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return {
        success: false,
        error: "Sesi telah berakhir. Silakan masuk kembali.",
      };
    }

    if (!payload.submissionId) {
      return {
        success: false,
        error: "ID laporan tidak ditemukan.",
      };
    }

    if (!payload.status) {
      return {
        success: false,
        error: "Status baru wajib dipilih.",
      };
    }

    const { error } = await supabase
      .from("item_submissions")
      .update({ status: payload.status })
      .eq("id", payload.submissionId);

    if (error) {
      if (
        error.message.includes("permission denied") ||
        error.code === "42501"
      ) {
        return {
          success: false,
          error:
            "Izin database belum diberikan. Silakan jalankan perintah SQL migration di Supabase SQL Editor untuk mengaktifkan izin update status.",
        };
      }
      return {
        success: false,
        error: "Gagal memperbarui status debug: " + error.message,
      };
    }

    return { success: true };
  } catch (cause) {
    return {
      success: false,
      error:
        cause instanceof Error
          ? cause.message
          : "Terjadi kesalahan saat memperbarui debug.",
    };
  }
}

