import { suggestDetails } from "@/lib/ai/suggest-details";
import { aiErrorResponse } from "@/lib/ai/error-response";
import { failure, readReportRequest } from "@/lib/reports/request";

export async function POST(request: Request) {
  const input = await readReportRequest(request, "suggest");
  if (input instanceof Response) return input;
  if (input.form.get("consent") !== "yes") return failure("Setujui pengiriman foto ke Google Gemini.", 400);
  if (!process.env.GEMINI_API_KEY || !process.env.GEMINI_MODEL) return failure("AI belum tersedia. Anda tetap bisa mengisi manual.", 503);
  try {
    return Response.json({ suggestion: await suggestDetails(input.image) }, { headers: { "Cache-Control": "no-store" } });
  } catch (cause) {
    const result = aiErrorResponse(cause);
    return failure(result.error, result.status);
  }
}
