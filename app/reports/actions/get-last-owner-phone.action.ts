import { supabase } from "@/lib/supabase";
import { formatPhoneDisplay } from "@/lib/notifications/format";

/** Prefills the WhatsApp field from the signed-in owner's latest report. */
export async function getLastOwnerPhone(): Promise<string> {
  try {
    const { data } = await supabase
      .from("item_submissions")
      .select("owner_phone")
      .not("owner_phone", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data?.owner_phone ? formatPhoneDisplay(data.owner_phone).replace(/-/g, " ") : "";
  } catch {
    return "";
  }
}
