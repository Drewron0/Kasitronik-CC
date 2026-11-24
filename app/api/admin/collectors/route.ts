import { requireAdmin } from "@/lib/auth/require-admin";
import { adminJson, getAdminStore, readJsonObject } from "@/lib/collector/admin-server";
import { getAppUrl } from "@/lib/collector/server";
import { createCollectorEntry, listCollectorRows } from "@/lib/collector/services/admin";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    return adminJson({ collectors: await listCollectorRows(getAdminStore()) });
  } catch (error) {
    console.error("[admin:collectors]", error);
    return adminJson({ error: "Daftar pengepul gagal dimuat." }, 503);
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const body = await readJsonObject(request);
  if (!body) return adminJson({ error: "Kiriman tidak dapat dibaca." }, 400);
  try {
    const result = await createCollectorEntry(getAdminStore(), body, getAppUrl());
    return result.ok ? adminJson({ id: result.id, link: result.link }, 201) : adminJson(result, 400);
  } catch (error) {
    console.error("[admin:collectors:create]", error);
    return adminJson({ error: "Pengepul gagal disimpan." }, 503);
  }
}
