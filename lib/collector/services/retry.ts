import type { CollectorContext } from "../interfaces/collector-context.interface.ts";
import type { PushTarget } from "../interfaces/push-target.interface.ts";
import type { EmailMessage } from "../../notifications/interfaces/email-message.interface.ts";
import type { PushPayload } from "../../notifications/interfaces/push-payload.interface.ts";
import type { SendResult } from "../../notifications/interfaces/send-result.type.ts";
import { NOTIFY_MAX_ATTEMPTS } from "../rules.ts";

/** Resends failed notifications until each has been tried NOTIFY_MAX_ATTEMPTS times. */
export async function retryNotifications(ctx: CollectorContext): Promise<{ retried: number }> {
  const entries = await ctx.store.listRetryableNotifications(NOTIFY_MAX_ATTEMPTS);
  for (const entry of entries) {
    let result: SendResult;
    if (entry.channel === "push") {
      const { target, payload } = entry.payload as { target: PushTarget; payload: PushPayload };
      result = await ctx.notifier.push(target, payload);
      if (!result.ok && result.gone) await ctx.store.deletePushTarget(target.endpoint);
    } else {
      result = await ctx.notifier.email(entry.payload as EmailMessage);
    }
    const gone = !result.ok && result.gone;
    await ctx.store.updateNotification(entry.id as string, {
      status: result.ok ? "sent" : "failed",
      attempts: gone ? NOTIFY_MAX_ATTEMPTS : entry.attempts + 1,
      lastError: result.ok ? null : result.error,
    });
  }
  return { retried: entries.length };
}
