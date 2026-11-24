import type { CollectorContext } from "../interfaces/collector-context.interface.ts";
import type { EmailMessage } from "../../notifications/interfaces/email-message.interface.ts";
import type { PushPayload } from "../../notifications/interfaces/push-payload.interface.ts";
import type { SendResult } from "../../notifications/interfaces/send-result.type.ts";

async function log(ctx: CollectorContext, channel: "push" | "email", kind: string, recipient: string, payload: unknown, result: SendResult) {
  try {
    await ctx.store.logNotification({
      channel, kind, recipient, payload,
      status: result.ok ? "sent" : "failed",
      attempts: 1,
      lastError: result.ok ? null : result.error,
    });
  } catch (error) {
    console.error("[notify] could not log notification", error);
  }
}

/** Pushes to every device of a collector; drops subscriptions the push service reports as gone. */
export async function notifyCollector(ctx: CollectorContext, collectorId: string, kind: string, payload: PushPayload): Promise<void> {
  const targets = await ctx.store.listPushTargets(collectorId);
  for (const target of targets) {
    const result = await ctx.notifier.push(target, payload);
    if (!result.ok && result.gone) await ctx.store.deletePushTarget(target.endpoint);
    await log(ctx, "push", kind, target.endpoint, { collectorId, target, payload }, result);
  }
}

async function sendEmail(ctx: CollectorContext, kind: string, message: EmailMessage) {
  const result = await ctx.notifier.email(message);
  await log(ctx, "email", kind, message.to, message, result);
}

export async function notifyOwner(ctx: CollectorContext, ownerId: string, kind: string, build: (to: string) => EmailMessage): Promise<void> {
  const to = await ctx.store.getOwnerEmail(ownerId);
  if (to) await sendEmail(ctx, kind, build(to));
}

export async function notifyAdmin(ctx: CollectorContext, kind: string, build: (to: string) => EmailMessage): Promise<void> {
  if (ctx.adminEmail) await sendEmail(ctx, kind, build(ctx.adminEmail));
}

/** Notifications never break the flow that triggered them. */
export async function safely(task: () => Promise<void>): Promise<void> {
  try {
    await task();
  } catch (error) {
    console.error("[notify] failed", error);
  }
}
