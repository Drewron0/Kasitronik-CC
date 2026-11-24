import type { ClaimResult } from "../interfaces/claim-result.type.ts";
import type { CollectorContext } from "../interfaces/collector-context.interface.ts";
import { createAccessToken } from "../tokens.ts";
import { ownerClaimedEmail } from "../../notifications/messages.ts";
import { notifyOwner, safely } from "./notify.ts";
import { mayTakeOpenJob } from "./eligibility.ts";

export async function claimSubmission(ctx: CollectorContext, collectorId: string, submissionId: string): Promise<ClaimResult> {
  const { store } = ctx;
  const before = await store.getSubmission(submissionId);
  if (!before) return { kind: "not_found" };
  if (before.status !== "pending") return before.collectorId === collectorId && before.status === "accepted" ? { kind: "claimed" } : before.status === "accepted" ? { kind: "taken" } : { kind: "closed" };

  if (!(await mayTakeOpenJob(ctx, collectorId, before))) return { kind: "closed" };

  const won = await store.updateSubmissionIf(
    submissionId,
    { status: "pending", collectorId: null },
    { status: "accepted", collector_id: collectorId, claimed_at: ctx.now.toISOString() },
  );
  if (!won) {
    const after = await store.getSubmission(submissionId);
    if (after?.status === "accepted") return after.collectorId === collectorId ? { kind: "claimed" } : { kind: "taken" };
    return { kind: "closed" };
  }

  // A claim from the collector home has no offer yet; record one so history stays complete.
  if (!(await store.findOffer(submissionId, collectorId))) {
    await store.insertOffers([{ submissionId, collectorId, tokenHash: createAccessToken().hash, wave: 0 }]);
  }
  await store.setOffersStatus(submissionId, "claimed", { onlyCollectorId: collectorId });
  await store.setOffersStatus(submissionId, "lost", { exceptCollectorId: collectorId, fromStatus: "sent" });

  await safely(async () => {
    const [collector, rating, sub] = await Promise.all([store.getCollector(collectorId), store.getCollectorRating(collectorId), store.getSubmission(submissionId)]);
    if (collector && sub) await notifyOwner(ctx, sub.ownerId, "owner_claimed", to => ownerClaimedEmail(to, sub, collector, rating, ctx.appUrl));
  });
  return { kind: "claimed" };
}
