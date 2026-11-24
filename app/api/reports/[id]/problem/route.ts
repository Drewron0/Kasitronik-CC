import { requestUser } from "@/lib/auth/request-user";
import { getCollectorContext } from "@/lib/collector/server";
import { PROBLEM_MAX, PROBLEM_MIN, reportProblem } from "@/lib/collector/services/owner";

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request, { params }: RouteContext<"/api/reports/[id]/problem">) {
  const auth = await requestUser(request);
  if (auth.error || !auth.ownerId) return json({ error: auth.error ?? "Masuk terlebih dahulu." }, auth.status ?? 401);
  const { id } = await params;
  let message = "";
  try {
    const body = (await request.json()) as { message?: unknown };
    message = typeof body.message === "string" ? body.message.slice(0, PROBLEM_MAX + 1) : "";
  } catch {
    return json({ error: "Kiriman tidak dapat dibaca." }, 400);
  }
  try {
    const result = await reportProblem(getCollectorContext(), auth.ownerId, id, message);
    if (result.kind === "invalid") return json({ error: `Ceritakan masalahnya dalam ${PROBLEM_MIN}-${PROBLEM_MAX} karakter.` }, 400);
    if (result.kind === "not_found") return json({ error: "Laporan tidak ditemukan." }, 404);
    if (result.kind === "conflict") return json({ error: "Masalah hanya bisa dilaporkan setelah laporan diambil pengepul." }, 409);
    return json({ status: "reported" });
  } catch (error) {
    console.error("[reports:problem]", error);
    return json({ error: "Laporan masalah gagal dikirim. Coba lagi." }, 503);
  }
}
