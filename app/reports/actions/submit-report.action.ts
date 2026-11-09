import { supabase } from "@/lib/supabase";
import { isSuggestion } from "../item-details";

export class ReportRequestError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

async function send(form: FormData, endpoint: string) {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) throw new ReportRequestError("Masuk terlebih dahulu untuk submit barang.", 401);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${data.session.access_token}` },
    body: form,
    signal: AbortSignal.timeout(120_000),
  });
  const payload = await response.json();
  if (!response.ok) throw new ReportRequestError(typeof payload.error === "string" ? payload.error : "Permintaan gagal. Coba lagi.", response.status);
  return payload;
}

export async function requestSuggestions(form: FormData) {
  const payload = await send(form, "/api/reports/suggest");
  if (!isSuggestion(payload.suggestion)) throw new Error("Saran AI tidak dapat dibaca. Isi manual atau coba lagi.");
  return payload.suggestion;
}

export async function submitReport(form: FormData) {
  const payload = await send(form, "/api/reports");
  if (typeof payload.id !== "string" || payload.id !== form.get("submissionId") || payload.status !== "pending") throw new Error("Status belum dapat dipastikan. Coba kirim kembali.");
  return payload.id as string;
}
