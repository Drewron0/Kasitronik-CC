import "server-only";
import { requestUser } from "@/lib/auth/request-user";
import { MAX_IMAGE_BYTES } from "@/app/reports/item-details";
import { normalizeImage } from "@/lib/ai/image";
import { takeAssessmentSlot } from "@/lib/ai/rate-limit";

export function failure(error: string, status: number) {
  return Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function readReportRequest(request: Request, purpose: "suggest" | "submit") {
  const auth = await requestUser(request);
  if (auth.error) return failure(auth.error, auth.status);
  const { client, ownerId } = auth;
  if (!client || !ownerId) return failure("Tidak dapat memverifikasi akun. Coba lagi.", 503);
  if (!takeAssessmentSlot(`${purpose}:${ownerId}`)) return failure("Batas 5 percobaan per 10 menit tercapai. Coba lagi nanti.", 429);

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.startsWith("multipart/form-data")) return failure("Format kiriman tidak sesuai.", 400);

  let form: FormData;
  try {
    // Bound the actual body, including requests without an honest Content-Length.
    const reader = request.body?.getReader();
    if (!reader) return failure("Foto belum dipilih.", 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_IMAGE_BYTES + 64 * 1024) {
        await reader.cancel();
        return failure("Foto terlalu besar. Maksimal 5 MB.", 413);
      }
      chunks.push(value);
    }
    form = await new Response(Buffer.concat(chunks), { headers: { "Content-Type": contentType } }).formData();
  } catch {
    return failure("Kiriman tidak dapat dibaca. Pilih ulang foto.", 400);
  }

  const photo = form.get("photo");
  if (!(photo instanceof File) || !photo.size || photo.size > MAX_IMAGE_BYTES) {
    return failure("Pilih satu foto JPEG atau PNG, maksimal 5 MB.", 400);
  }
  if (!["image/jpeg", "image/png"].includes(photo.type)) {
    return failure("Gunakan foto JPEG atau PNG.", 400);
  }

  let image: Buffer;
  try {
    image = await normalizeImage(Buffer.from(await photo.arrayBuffer()));
  } catch {
    return failure("Foto rusak atau tidak didukung. Gunakan JPEG/PNG maksimal 20 megapiksel.", 400);
  }

  return { client, ownerId, form, image };
}
