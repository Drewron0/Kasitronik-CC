import { supabase } from "@/lib/supabase";
import type { SubmissionItem } from "../interfaces/submission-item.interface";
import type { SubmissionCollector } from "../interfaces/submission-collector.interface";

/** Collector name, phone and rating per submission, through the owner-scoped SQL function. */
async function loadCollectors(): Promise<Map<string, SubmissionCollector>> {
  const { data, error } = await supabase.rpc("get_my_submission_collectors");
  const map = new Map<string, SubmissionCollector>();
  if (error || !Array.isArray(data)) return map;
  for (const row of data) {
    map.set(row.submission_id, {
      name: row.collector_name,
      phone: row.collector_phone,
      rating: row.collector_rating === null ? null : Number(row.collector_rating),
      completedJobs: row.completed_jobs ?? 0,
    });
  }
  return map;
}

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

    const collectors = await loadCollectors();

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
          collector: collectors.get(row.id) ?? null,
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
