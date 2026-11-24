"use server";

import { revalidatePath } from "next/cache";
import { getCollectorContext } from "@/lib/collector/server";
import { claimSubmission } from "@/lib/collector/services/claim";
import { claimMessage, INVALID_LINK } from "../action-messages";
import { resolveJob } from "../current-collector";
import type { ActionResult } from "../interfaces/action-result.type";
import type { JobRef } from "../interfaces/job-ref.type";

export async function claimJob(ref: JobRef): Promise<ActionResult> {
  const ctx = getCollectorContext();
  const job = await resolveJob(ctx, ref);
  if (!job) return INVALID_LINK;
  const result = claimMessage(await claimSubmission(ctx, job.collectorId, job.submissionId));
  revalidatePath("/p");
  return result;
}
