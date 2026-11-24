import type { CollectorContext } from "../interfaces/collector-context.interface.ts";
import { decideWave } from "../candidates.ts";
import { MAX_WAVES } from "../rules.ts";
import { adminAlertEmail } from "../../notifications/messages.ts";
import { dispatchWave } from "./dispatch.ts";
import { notifyAdmin, safely } from "./notify.ts";

/** One cron pass: sends due waves and alerts the admin once for reports nobody took. */
export async function runDispatchTick(ctx: CollectorContext): Promise<{ waves: number; escalated: number }> {
  let waves = 0;
  let escalated = 0;
  for (const sub of await ctx.store.listPending()) {
    const decision = decideWave(sub, ctx.now);
    if (decision === "wave") {
      if ((await dispatchWave(ctx, sub.id)).wave !== null) waves++;
    } else if (decision === "escalate") {
      // Moving past MAX_WAVES marks the alert as sent, so it fires exactly once.
      const marked = await ctx.store.updateSubmissionIf(sub.id, { status: "pending", waveCount: MAX_WAVES }, { wave_count: MAX_WAVES + 1 });
      if (!marked) continue;
      escalated++;
      await safely(() => notifyAdmin(ctx, "admin_unclaimed", to => adminAlertEmail(to, "unclaimed", sub)));
    }
  }
  return { waves, escalated };
}
