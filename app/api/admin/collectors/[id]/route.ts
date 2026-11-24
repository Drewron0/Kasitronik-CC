import { requireAdmin } from "@/lib/auth/require-admin";
import { adminJson, getAdminStore, readJsonObject } from "@/lib/collector/admin-server";
import { getAppUrl } from "@/lib/collector/server";
import { updateCollectorEntry } from "@/lib/collector/services/admin";

export async function PATCH(request: Request, { params }: RouteContext<"/api/admin/collectors/[id]">) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const body = await readJsonObject(request);
  if (!body) return adminJson({ error: "Kiriman tidak dapat dibaca." }, 400);
  const { id } = await params;
  try {
    const result = await updateCollectorEntry(getAdminStore(), id, body, getAppUrl());
    if (result.ok) return adminJson(result.link ? { link: result.link } : { status: "updated" });
    return adminJson(result, result.error === "Pengepul tidak ditemukan." ? 404 : 400);
  } catch (error) {
    console.error("[admin:collectors:update]", error);
    return adminJson({ error: "Perubahan gagal disimpan." }, 503);
  }
}
