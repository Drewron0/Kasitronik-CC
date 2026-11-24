"use server";

import { revalidatePath } from "next/cache";
import { getCollectorContext } from "@/lib/collector/server";
import { completeJob } from "@/lib/collector/services/complete";
import { completeMessage, INVALID_LINK } from "../action-messages";
import { resolveJob } from "../current-collector";
import type { ActionResult } from "../interfaces/action-result.type";
import type { JobRef } from "../interfaces/job-ref.type";

export async function completeHandover(ref: JobRef, code: string, price: string): Promise<ActionResult> {
  const ctx = getCollectorContext();
  const job = await resolveJob(ctx, ref);
  if (!job) return INVALID_LINK;
  const result = completeMessage(await completeJob(ctx, job.collectorId, job.submissionId, String(code).slice(0, 8), String(price).slice(0, 32)));
  revalidatePath("/p");
  return result;
}
