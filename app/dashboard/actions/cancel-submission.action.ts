import { supabase } from "@/lib/supabase";

export interface CancelSubmissionResult {
  success: boolean;
  error?: string;
}

export async function cancelSubmissionAction(
  submissionId: string
): Promise<CancelSubmissionResult> {
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

    if (!submissionId) {
      return {
        success: false,
        error: "ID laporan tidak valid.",
      };
    }

    const { error } = await supabase
      .from("item_submissions")
      .update({ status: "cancelled" })
      .eq("id", submissionId)
      .eq("status", "pending");

    if (error) {
      return {
        success: false,
        error: "Gagal membatalkan laporan: " + error.message,
      };
    }

    return { success: true };
  } catch (cause) {
    return {
      success: false,
      error: cause instanceof Error ? cause.message : "Terjadi kesalahan saat membatalkan laporan.",
    };
  }
}
