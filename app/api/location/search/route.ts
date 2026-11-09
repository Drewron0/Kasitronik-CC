import { requestUser } from "@/lib/auth/request-user";
import { getGeocoder } from "@/lib/location/geocoder";
import { takeSearchSlot } from "@/lib/location/search-limit";

const respond = (payload: object, status = 200) => Response.json(payload, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  const auth = await requestUser(request);
  if (auth.error) return respond({ error: auth.error }, auth.status);
  if (!takeSearchSlot(auth.ownerId!)) return respond({ error: "Pencarian terlalu sering. Tunggu sebentar lalu coba lagi." }, 429);
  let query: string;
  try {
    if (!request.headers.get("content-type")?.startsWith("application/json")) throw new Error();
    const reader = request.body?.getReader();
    if (!reader) throw new Error();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 2048) { await reader.cancel(); return respond({ error: "Pencarian terlalu panjang." }, 413); }
      chunks.push(value);
    }
    const payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (typeof payload.query !== "string") throw new Error();
    query = payload.query.trim();
    if (query.length < 3 || query.length > 200) throw new Error();
  } catch { return respond({ error: "Masukkan alamat atau tempat, 3-200 karakter." }, 400); }
  try {
    return respond({ results: await getGeocoder().searchAddress(query, request.signal) });
  } catch (error) {
    return respond({ error: error instanceof Error && error.name === "Error" ? error.message : "Pencarian tidak dapat dihubungi. Coba lagi." }, 503);
  }
}
