import { requestUser } from "@/lib/auth/request-user";
import { getCollectorContext } from "@/lib/collector/server";
import { cancelByOwner } from "@/lib/collector/services/owner";

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request, { params }: RouteContext<"/api/reports/[id]/cancel">) {
  const auth = await requestUser(request);
  if (auth.error || !auth.ownerId) return json({ error: auth.error ?? "Masuk terlebih dahulu." }, auth.status ?? 401);
  const { id } = await params;
  try {
    const result = await cancelByOwner(getCollectorContext(), auth.ownerId, id);
    if (result.kind === "not_found") return json({ error: "Laporan tidak ditemukan." }, 404);
    if (result.kind === "conflict") return json({ error: "Laporan ini sudah tidak bisa dibatalkan." }, 409);
    return json({ status: "cancelled" });
  } catch (error) {
    console.error("[reports:cancel]", error);
    return json({ error: "Pembatalan gagal. Coba lagi." }, 503);
  }
}
