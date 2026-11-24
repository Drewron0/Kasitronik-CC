import type { CollectorContext } from "../interfaces/collector-context.interface.ts";
import type { SubmissionForCollector } from "../interfaces/submission-for-collector.interface.ts";
import type { CandidateCollector } from "../interfaces/candidate-collector.interface.ts";
import { areaCovers } from "../geo.ts";
import { digestPush } from "../../notifications/messages.ts";
import { notifyCollector, safely } from "./notify.ts";

export function pendingInAreas(collector: CandidateCollector, pending: SubmissionForCollector[]): SubmissionForCollector[] {
  return pending.filter(sub => collector.areas.some(area => areaCovers(area, { latitude: sub.latitude, longitude: sub.longitude })));
}

/** Sends one summary push to each digest-mode collector who has new reports in their areas. */
export async function runDigest(ctx: CollectorContext): Promise<{ sent: number }> {
  const pending = await ctx.store.listPending();
  let sent = 0;
  for (const candidate of await ctx.store.listDispatchable()) {
    if (candidate.notifyMode !== "digest" || candidate.paused || !candidate.active) continue;
    const collector = await ctx.store.getCollector(candidate.id);
    if (!collector) continue;
    const since = collector.lastDigestAt ? new Date(collector.lastDigestAt).getTime() : 0;
    const fresh = pendingInAreas(collector, pending).filter(sub => new Date(sub.createdAt).getTime() > since);
    if (!fresh.length) continue;
    await safely(() => notifyCollector(ctx, collector.id, "digest", digestPush(fresh.length, `${ctx.appUrl}/p`)));
    await ctx.store.updateCollector(collector.id, { last_digest_at: ctx.now.toISOString() });
    sent++;
  }
  return { sent };
}
