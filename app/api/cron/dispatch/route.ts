import { verifyCronSecret } from "@/lib/cron/verify-secret";
import { getCollectorContext } from "@/lib/collector/server";
import { runDispatchTick } from "@/lib/collector/services/tick";
import { retryNotifications } from "@/lib/collector/services/retry";

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  if (!verifyCronSecret(request, process.env.CRON_SECRET)) return json({ error: "Tidak diizinkan." }, 401);
  try {
    const ctx = getCollectorContext();
    const tick = await runDispatchTick(ctx);
    const retry = await retryNotifications(ctx);
    return json({ ...tick, ...retry });
  } catch (error) {
    console.error("[cron:dispatch]", error);
    return json({ error: "Penjadwal gagal berjalan." }, 500);
  }
}

export function GET() {
  return json({ error: "Gunakan POST." }, 405);
}
