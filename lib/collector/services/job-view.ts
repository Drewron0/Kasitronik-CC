import type { CollectorContext } from "../interfaces/collector-context.interface.ts";
import type { JobSummary, JobView } from "../interfaces/job-view.type.ts";
import type { SubmissionForCollector } from "../interfaces/submission-for-collector.interface.ts";
import { distanceKm } from "../geo.ts";
import { HANDOVER_MAX_ATTEMPTS } from "../rules.ts";
import { mayTakeOpenJob } from "./eligibility.ts";

function summary(sub: SubmissionForCollector, distance: number | null): JobSummary {
  return {
    submissionId: sub.id,
    itemName: sub.itemName,
    category: sub.category,
    quantity: sub.quantity,
    condition: sub.condition,
    weightLabel: sub.weightLabel,
    district: sub.district,
    distanceKm: distance,
    photoPath: sub.photoPath,
    createdAt: sub.createdAt,
  };
}

/** Builds what one collector may see of one submission. Contact details only for the holder. */
export async function buildJobView(ctx: CollectorContext, collectorId: string, submissionId: string): Promise<JobView> {
  const [sub, collector] = await Promise.all([ctx.store.getSubmission(submissionId), ctx.store.getCollector(collectorId)]);
  if (!sub || !collector) return { state: "closed" };

  const point = { latitude: sub.latitude, longitude: sub.longitude };
  const distance = collector.areas.length ? Math.min(...collector.areas.map(area => distanceKm(area, point))) : null;
  const mine = sub.collectorId === collectorId;

  if (sub.status === "pending") {
    return (await mayTakeOpenJob(ctx, collectorId, sub)) ? { state: "open", ...summary(sub, distance) } : { state: "closed" };
  }
  if (sub.status === "accepted" && mine) {
    return {
      state: "mine",
      ...summary(sub, distance),
      address: sub.address,
      instructions: sub.instructions,
      ownerPhone: sub.ownerPhone,
      latitude: sub.latitude,
      longitude: sub.longitude,
      lockedUntil: sub.handoverLockedUntil && new Date(sub.handoverLockedUntil) > ctx.now ? sub.handoverLockedUntil : null,
      attemptsLeft: HANDOVER_MAX_ATTEMPTS - sub.handoverAttempts,
    };
  }
  if (sub.status === "completed" && mine) return { state: "done", agreedPriceIdr: sub.agreedPriceIdr, ...summary(sub, distance) };
  if (sub.status === "accepted") return { state: "taken" };
  return { state: "closed" };
}
