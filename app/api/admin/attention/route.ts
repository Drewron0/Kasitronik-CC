import { requireAdmin } from "@/lib/auth/require-admin";
import { adminJson, getAdminStore } from "@/lib/collector/admin-server";
import { listAttention } from "@/lib/collector/services/admin";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  try {
    const { unclaimed, problems } = await listAttention(getAdminStore());
    return adminJson({
      unclaimed: unclaimed.map(s => ({ id: s.id, itemName: s.itemName, quantity: s.quantity, district: s.district, address: s.address, createdAt: s.createdAt })),
      problems,
    });
  } catch (error) {
    console.error("[admin:attention]", error);
    return adminJson({ error: "Daftar perhatian gagal dimuat." }, 503);
  }
}
