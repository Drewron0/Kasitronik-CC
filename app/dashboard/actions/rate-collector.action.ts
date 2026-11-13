import { supabase } from "@/lib/supabase";
import type {
  RateCollectorPayload,
  RateCollectorResult,
} from "../interfaces/rate-collector.interface";

export async function rateCollectorAction(
  payload: RateCollectorPayload
): Promise<RateCollectorResult> {
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

    const rating = Math.round(Number(payload.rating));
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return {
        success: false,
        error: "Penilaian harus bernilai antara 1 sampai 5 bintang.",
      };
    }

    const review = (payload.review || "").trim();
    if (review.length > 1000) {
      return {
        success: false,
        error: "Ulasan tidak boleh melebihi 1000 karakter.",
      };
    }

    const ratedAt = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("item_submissions")
      .update({
        collector_rating: rating,
        collector_review: review,
        rated_at: ratedAt,
      })
      .eq("id", payload.submissionId)
      .eq("status", "completed");

    if (updateError) {
      return {
        success: false,
        error: "Gagal menyimpan penilaian: " + updateError.message,
      };
    }

    return {
      success: true,
      data: {
        collector_rating: rating,
        collector_review: review,
        rated_at: ratedAt,
      },
    };
  } catch (cause) {
    return {
      success: false,
      error:
        cause instanceof Error
          ? cause.message
          : "Terjadi kesalahan saat menyimpan penilaian mitra.",
    };
  }
}
