import { supabase } from "@/lib/supabase";
import { parseRating } from "../rating";
import type { RateCollectorPayload, RateCollectorResult } from "../interfaces/rate-collector.interface";

/** Saves the owner's rating; RLS only allows it on their own completed reports. */
export async function rateCollectorAction(payload: RateCollectorPayload): Promise<RateCollectorResult> {
  const checked = parseRating(payload);
  if (!checked.ok) return { success: false, error: checked.error };
  const rated_at = new Date().toISOString();
  const { data, error } = await supabase
    .from("item_submissions")
    .update({ collector_rating: checked.rating, collector_review: checked.review, rated_at })
    .eq("id", payload.submissionId)
    .eq("status", "completed")
    .select("collector_rating, collector_review, rated_at");
  if (error || !data?.length) return { success: false, error: "Rating belum tersimpan. Coba lagi." };
  return { success: true, data: data[0] as RateCollectorResult["data"] };
}
