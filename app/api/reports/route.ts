import { parseSubmission } from "@/app/reports/item-details";
import { parsePickupLocation } from "@/app/location/location";
import { failure, readReportRequest } from "@/lib/reports/request";
import { parseOwnerPhone } from "@/app/reports/owner-phone";
import { createHandoverCode } from "@/lib/collector/handover";
import { reverseDistrict } from "@/lib/location/reverse-district";
import { getCollectorContext } from "@/lib/collector/server";
import { dispatchWave } from "@/lib/collector/services/dispatch";

export async function POST(request: Request) {
  const input = await readReportRequest(request, "submit");
  if (input instanceof Response) return input;
  const { client, ownerId, form, image } = input;
  let details;
  try { details = { ...parseSubmission(form), ...parsePickupLocation(form), ...parseOwnerPhone(form) }; }
  catch (error) { return failure(error instanceof Error ? error.message : "Detail tidak valid.", 400); }
  const success = () => Response.json({ id: details.id, status: "pending" }, { headers: { "Cache-Control": "no-store" } });
  const photoPath = `${ownerId}/${details.id}/photo.jpg`;
  try {
    const existing = await client.from("item_submissions").select("id").eq("id", details.id).maybeSingle();
    if (existing.error) return failure("Penyimpanan belum tersedia. Pengelola perlu memeriksa migrasi Supabase.", 503);
    if (existing.data) return success();
    const uploaded = await client.storage.from("submission-photos").upload(photoPath, image, { contentType: "image/jpeg", upsert: false });
    // A retry reuses the same object and ID after an interrupted response.
    if (uploaded.error && !["409", "Duplicate"].includes(String(uploaded.error.statusCode))) return failure("Foto belum berhasil disimpan. Coba kirim kembali.", 503);
    const pickup_district = await reverseDistrict(process.env.GEOAPIFY_API_KEY ?? "", { latitude: details.pickup_latitude, longitude: details.pickup_longitude });
    const { error } = await client.from("item_submissions").insert({
      ...details, pickup_district, handover_code: createHandoverCode(), owner_id: ownerId, photo_path: photoPath, status: "pending",
    });
    if (!error) {
      // Offering to collectors is best effort: the report is saved and cron retries the wave.
      try { await dispatchWave(getCollectorContext(), details.id); }
      catch (dispatchError) { console.error("[reports] first wave failed", dispatchError); }
      return success();
    }
    const retried = await client.from("item_submissions").select("id").eq("id", details.id).maybeSingle();
    if (retried.data) return success();
    // Retain the photo on ambiguous failures so a retry can finish the same submission.
    if (!retried.error && ["23514", "23502", "42501", "22003"].includes(error.code)) {
      await client.storage.from("submission-photos").remove([photoPath]);
    }
    return failure("Detail belum berhasil disimpan. Coba kirim kembali.", 503);
  } catch {
    return failure("Koneksi penyimpanan terputus. Coba kirim kembali untuk memastikan statusnya.", 503);
  }
}
