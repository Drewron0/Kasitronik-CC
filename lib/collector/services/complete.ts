import type { CollectorContext } from "../interfaces/collector-context.interface.ts";
import type { CompleteResult } from "../interfaces/complete-result.type.ts";
import { checkHandover } from "../handover.ts";
import { parsePriceIdr } from "../price.ts";
import { HANDOVER_MAX_ATTEMPTS } from "../rules.ts";
import { ownerDoneEmail } from "../../notifications/messages.ts";
import { notifyOwner, safely } from "./notify.ts";

/** Each concurrent guess re-reads after losing the race, so at most HANDOVER_MAX_ATTEMPTS guesses are ever checked. */
const MAX_RACE_RETRIES = 25;

export async function completeJob(
  ctx: CollectorContext,
  collectorId: string,
  submissionId: string,
  code: string,
  priceInput: string,
): Promise<CompleteResult> {
  const { store } = ctx;
  const price = parsePriceIdr(priceInput);

  for (let round = 0; round < MAX_RACE_RETRIES; round++) {
    const sub = await store.getSubmission(submissionId);
    if (!sub || sub.status !== "accepted" || sub.collectorId !== collectorId || !sub.handoverCode) return { kind: "not_yours" };
    if (price === "invalid") return { kind: "invalid_price" };

    // The attempt counter is part of the condition: a write based on a stale count fails and the guess is re-checked.
    const expected = { status: "accepted", collectorId, handoverAttempts: sub.handoverAttempts };
    const check = checkHandover({ code: sub.handoverCode, attempts: sub.handoverAttempts, lockedUntil: sub.handoverLockedUntil }, code, ctx.now);
    if (check.kind === "locked") return check;

    if (check.kind === "wrong") {
      const saved = await store.updateSubmissionIf(submissionId, expected, { handover_attempts: check.attempts, handover_locked_until: check.lockedUntil });
      if (!saved) continue;
      return check.lockedUntil ? { kind: "locked", lockedUntil: check.lockedUntil } : { kind: "wrong_code", attemptsLeft: HANDOVER_MAX_ATTEMPTS - check.attempts };
    }

    const done = await store.updateSubmissionIf(submissionId, expected, {
      status: "completed",
      completed_at: ctx.now.toISOString(),
      agreed_price_idr: price,
      handover_attempts: 0,
      handover_locked_until: null,
    });
    if (!done) continue;
    await safely(() => notifyOwner(ctx, sub.ownerId, "owner_done", to => ownerDoneEmail(to, sub, price, ctx.appUrl)));
    return { kind: "completed" };
  }
  return { kind: "locked", lockedUntil: ctx.now.toISOString() };
}
