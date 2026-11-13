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

    const updateFields: Record<string, unknown> = {};

    if (payload.status !== undefined) {
      updateFields.status = payload.status;
    }

    if (payload.collector_name !== undefined) {
      updateFields.collector_name = payload.collector_name;
    }

    if (payload.collector_phone !== undefined) {
      updateFields.collector_phone = payload.collector_phone;
    }

    if (payload.reset_rating) {
      updateFields.collector_rating = null;
      updateFields.collector_review = "";
      updateFields.rated_at = null;
    }

    const { error } = await supabase
      .from("item_submissions")
      .update(updateFields)
      .eq("id", payload.submissionId);

    if (error) {
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
