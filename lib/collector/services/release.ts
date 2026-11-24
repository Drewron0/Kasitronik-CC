import type { CollectorContext } from "../interfaces/collector-context.interface.ts";
import type { ReleaseResult } from "../interfaces/release-result.type.ts";
import { WAVE_INTERVAL_MINUTES } from "../rules.ts";
import { ownerReleasedEmail } from "../../notifications/messages.ts";
import { notifyOwner, safely } from "./notify.ts";

export async function releaseJob(ctx: CollectorContext, collectorId: string, submissionId: string): Promise<ReleaseResult> {
  const { store } = ctx;
  // Restarting the wave count and backdating the last wave lets the next tick offer the job again right away;
  // collectors who already had it stay excluded through their existing offers.
  const dueNow = new Date(ctx.now.getTime() - WAVE_INTERVAL_MINUTES * 60_000).toISOString();
  const released = await store.updateSubmissionIf(
    submissionId,
    { status: "accepted", collectorId },
    { status: "pending", collector_id: null, claimed_at: null, wave_count: 0, last_wave_at: dueNow, handover_attempts: 0, handover_locked_until: null },
  );
  if (!released) return { kind: "not_yours" };

  await store.setOffersStatus(submissionId, "released", { onlyCollectorId: collectorId });
  await safely(async () => {
    const sub = await store.getSubmission(submissionId);
    if (sub) await notifyOwner(ctx, sub.ownerId, "owner_released", to => ownerReleasedEmail(to, sub, ctx.appUrl));
  });
  return { kind: "released" };
}
