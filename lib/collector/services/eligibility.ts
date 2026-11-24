import type { CollectorContext } from "../interfaces/collector-context.interface.ts";
import type { SubmissionForCollector } from "../interfaces/submission-for-collector.interface.ts";
import { areaCovers } from "../geo.ts";

/** A collector may see or take an open job when it was offered to them or lies in one of their areas. */
export async function mayTakeOpenJob(ctx: CollectorContext, collectorId: string, sub: SubmissionForCollector): Promise<boolean> {
  const collector = await ctx.store.getCollector(collectorId);
  if (!collector?.active) return false;
  const point = { latitude: sub.latitude, longitude: sub.longitude };
  if (collector.areas.some(area => areaCovers(area, point))) return true;
  return (await ctx.store.findOffer(sub.id, collectorId)) !== null;
}
