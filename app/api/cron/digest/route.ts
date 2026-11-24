import { verifyCronSecret } from "@/lib/cron/verify-secret";
import { getCollectorContext } from "@/lib/collector/server";
import { runDigest } from "@/lib/collector/services/digest";

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  if (!verifyCronSecret(request, process.env.CRON_SECRET)) return json({ error: "Tidak diizinkan." }, 401);
  try {
    return json(await runDigest(getCollectorContext()));
  } catch (error) {
    console.error("[cron:digest]", error);
    return json({ error: "Rangkuman gagal dikirim." }, 500);
  }
}

export function GET() {
  return json({ error: "Gunakan POST." }, 405);
}
