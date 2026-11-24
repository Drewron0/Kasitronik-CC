import { requireAdmin } from "@/lib/auth/require-admin";
import { adminJson, getAdminStore } from "@/lib/collector/admin-server";
import { resolveProblemEntry } from "@/lib/collector/services/admin";

export async function PATCH(request: Request, { params }: RouteContext<"/api/admin/problems/[id]">) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  try {
    return (await resolveProblemEntry(getAdminStore(), id, new Date()))
      ? adminJson({ status: "resolved" })
      : adminJson({ error: "Laporan masalah tidak ditemukan atau sudah ditangani." }, 404);
  } catch (error) {
    console.error("[admin:problems]", error);
    return adminJson({ error: "Perubahan gagal disimpan." }, 503);
  }
}
