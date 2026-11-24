import type { CollectorContext } from "../interfaces/collector-context.interface.ts";
import { releaseJob } from "./release.ts";

/** Hands every job a collector still holds back to dispatch, e.g. when an admin deactivates them. */
export async function releaseHeldJobs(ctx: CollectorContext, collectorId: string): Promise<number> {
  let released = 0;
  for (const sub of await ctx.store.listHeldBy(collectorId)) {
    if ((await releaseJob(ctx, collectorId, sub.id)).kind === "released") released++;
  }
  return released;
}
