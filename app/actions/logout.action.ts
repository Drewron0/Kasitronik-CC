import { supabase } from "@/lib/supabase";

export async function logoutAction(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut({
      scope: "local",
    });

    if (error) {
      return { success: false, error: "Gagal keluar. Silakan coba lagi." };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Tidak dapat menghubungi server." };
  }
}
