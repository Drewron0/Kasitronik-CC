import { supabase } from "@/lib/supabase";
import type { SubmissionItem } from "../interfaces/submission-item.interface";

export interface GetSubmissionsResult {
  success: boolean;
  data?: SubmissionItem[];
  error?: string;
}

export async function getUserSubmissionsAction(): Promise<GetSubmissionsResult> {
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

    const { data, error } = await supabase
      .from("item_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return {
        success: false,
        error: "Gagal memuat data laporan: " + error.message,
      };
    }

    if (!data) {
      return { success: true, data: [] };
    }

    // Generate signed URLs for private photos in batch/parallel
    const itemsWithPhotos: SubmissionItem[] = await Promise.all(
      data.map(async (row) => {
        let photo_url: string | null = null;
        if (row.photo_path) {
          const { data: signedData } = await supabase.storage
            .from("submission-photos")
            .createSignedUrl(row.photo_path, 3600); // 1 hour validity

          photo_url = signedData?.signedUrl ?? null;
        }

        return {
          ...row,
          photo_url,
        } as SubmissionItem;
      })
    );

    return {
      success: true,
      data: itemsWithPhotos,
    };
  } catch (cause) {
    return {
      success: false,
      error: cause instanceof Error ? cause.message : "Terjadi kesalahan saat mengambil laporan.",
    };
  }
}
