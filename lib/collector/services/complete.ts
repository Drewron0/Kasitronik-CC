import type { CollectorContext } from "../interfaces/collector-context.interface.ts";
import type { CompleteResult } from "../interfaces/complete-result.type.ts";
import { checkHandover } from "../handover.ts";
import { parsePriceIdr } from "../price.ts";
import { HANDOVER_MAX_ATTEMPTS } from "../rules.ts";
import { ownerDoneEmail } from "../../notifications/messages.ts";
import { notifyOwner, safely } from "./notify.ts";

export async function completeJob(
  ctx: CollectorContext,
  collectorId: string,
  submissionId: string,
  code: string,
  priceInput: string,
): Promise<CompleteResult> {
  const { store } = ctx;
  const sub = await store.getSubmission(submissionId);
  if (!sub || sub.status !== "accepted" || sub.collectorId !== collectorId || !sub.handoverCode) return { kind: "not_yours" };

  const price = parsePriceIdr(priceInput);
  if (price === "invalid") return { kind: "invalid_price" };

  const mine = { status: "accepted", collectorId };
  const check = checkHandover({ code: sub.handoverCode, attempts: sub.handoverAttempts, lockedUntil: sub.handoverLockedUntil }, code, ctx.now);
  if (check.kind === "locked") return check;
  if (check.kind === "wrong") {
    const saved = await store.updateSubmissionIf(submissionId, mine, { handover_attempts: check.attempts, handover_locked_until: check.lockedUntil });
    if (!saved) return { kind: "not_yours" };
    return check.lockedUntil ? { kind: "locked", lockedUntil: check.lockedUntil } : { kind: "wrong_code", attemptsLeft: HANDOVER_MAX_ATTEMPTS - check.attempts };
  }

  const done = await store.updateSubmissionIf(submissionId, mine, {
    status: "completed",
    completed_at: ctx.now.toISOString(),
    agreed_price_idr: price,
    handover_attempts: 0,
    handover_locked_until: null,
  });
  if (!done) return { kind: "not_yours" };

  await safely(() => notifyOwner(ctx, sub.ownerId, "owner_done", to => ownerDoneEmail(to, sub, price, ctx.appUrl)));
  return { kind: "completed" };
}
