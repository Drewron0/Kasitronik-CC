"use server";

import { revalidatePath } from "next/cache";
import { getCollectorContext } from "@/lib/collector/server";
import { releaseJob } from "@/lib/collector/services/release";
import { INVALID_LINK, releaseMessage } from "../action-messages";
import { resolveJob } from "../current-collector";
import type { ActionResult } from "../interfaces/action-result.type";
import type { JobRef } from "../interfaces/job-ref.type";

export async function releaseHeldJob(ref: JobRef): Promise<ActionResult> {
  const ctx = getCollectorContext();
  const job = await resolveJob(ctx, ref);
  if (!job) return INVALID_LINK;
  const result = releaseMessage(await releaseJob(ctx, job.collectorId, job.submissionId));
  revalidatePath("/p");
  return result;
}
