import "server-only";
import { getAdminClient } from "@/lib/supabase-admin";

/** Short-lived link to a private submission photo, for a collector who may see the job. */
export async function signedPhotoUrl(path: string): Promise<string | null> {
  try {
    const { data } = await getAdminClient().storage.from("submission-photos").createSignedUrl(path, 3600);
    return data?.signedUrl ?? null;
  } catch {
    return null;
  }
}
