import type { CollectorContext } from "../interfaces/collector-context.interface.ts";
import { adminAlertEmail, cancelledPush } from "../../notifications/messages.ts";
import { notifyAdmin, notifyCollector, safely } from "./notify.ts";

export const PROBLEM_MIN = 10;
export const PROBLEM_MAX = 1000;

/** Owner cancels a report that nobody has picked up yet. Ownership is checked here, not by RLS. */
export async function cancelByOwner(ctx: CollectorContext, ownerId: string, submissionId: string): Promise<{ kind: "cancelled" | "not_found" | "conflict" }> {
  const { store } = ctx;
  const sub = await store.getSubmission(submissionId);
  if (!sub || sub.ownerId !== ownerId) return { kind: "not_found" };
  if (sub.status !== "pending" && sub.status !== "accepted") return { kind: "conflict" };

  const cancelled = await store.updateSubmissionIf(submissionId, { status: sub.status, collectorId: sub.collectorId }, { status: "cancelled" });
  if (!cancelled) return { kind: "conflict" };

  await store.setOffersStatus(submissionId, "cancelled", { fromStatus: "sent" });
  if (sub.status === "accepted" && sub.collectorId) {
    const collectorId = sub.collectorId;
    await store.setOffersStatus(submissionId, "cancelled", { onlyCollectorId: collectorId });
    await safely(() => notifyCollector(ctx, collectorId, "collector_cancelled", cancelledPush(sub, `${ctx.appUrl}/p`)));
  }
  return { kind: "cancelled" };
}

/** Owner flags a problem with a pickup; the team is emailed. */
export async function reportProblem(
  ctx: CollectorContext,
  ownerId: string,
  submissionId: string,
  rawMessage: string,
): Promise<{ kind: "reported" | "invalid" | "not_found" | "conflict" }> {
  const message = String(rawMessage ?? "").trim();
  if (message.length < PROBLEM_MIN || message.length > PROBLEM_MAX) return { kind: "invalid" };
  const sub = await ctx.store.getSubmission(submissionId);
  if (!sub || sub.ownerId !== ownerId) return { kind: "not_found" };
  if (sub.status !== "accepted" && sub.status !== "completed") return { kind: "conflict" };

  await ctx.store.insertProblem({ submissionId, ownerId, message });
  await safely(() => notifyAdmin(ctx, "admin_problem", to => adminAlertEmail(to, "problem", sub, message)));
  return { kind: "reported" };
}
