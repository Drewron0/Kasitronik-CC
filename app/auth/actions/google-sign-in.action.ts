import { supabase } from "@/lib/supabase";
import type { GoogleSignInResult } from "../interfaces/google-sign-in-result.interface";

function safePath(path?: string) {
  return path?.startsWith("/") && !path.startsWith("//") ? path : "/";
}

export async function googleSignInAction(redirectTo?: string): Promise<GoogleSignInResult> {
  try {
    const callbackUrl = new URL(safePath(redirectTo), window.location.origin).toString();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl, skipBrowserRedirect: true },
    });

    if (error || !data.url) {
      return { success: false, error: "Masuk dengan Google belum tersedia. Coba lagi atau gunakan email dan kata sandi." };
    }
    return { success: true, url: data.url };
  } catch {
    return { success: false, error: "Tidak dapat menghubungi Google. Coba lagi." };
  }
}
