import "server-only";
import { pendingInAreas } from "@/lib/collector/services/digest";
import { buildJobView } from "@/lib/collector/services/job-view";
import type { Collector } from "@/lib/collector/interfaces/collector.interface";
import type { CollectorContext } from "@/lib/collector/interfaces/collector-context.interface";
import type { JobSummary, JobView } from "@/lib/collector/interfaces/job-view.type";
import type { HomeJob } from "./interfaces/home-job.interface";
import { signedPhotoUrl } from "./photo";

const OPEN_LIMIT = 20;

async function withPhoto(job: JobSummary): Promise<HomeJob> {
  return { job, photoUrl: await signedPhotoUrl(job.photoPath) };
}

/** Jobs the collector holds and open jobs in their areas, newest first. */
export async function loadHome(ctx: CollectorContext, collector: Collector) {
  const [heldSubs, pending, devices] = await Promise.all([
    ctx.store.listHeldBy(collector.id),
    ctx.store.listPending(),
    ctx.store.listPushTargets(collector.id),
  ]);
  const openSubs = pendingInAreas(collector, pending)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, OPEN_LIMIT);
  const views = await Promise.all([...heldSubs, ...openSubs].map(sub => buildJobView(ctx, collector.id, sub.id)));
  const held = views.filter((v): v is Extract<JobView, { state: "mine" }> => v.state === "mine");
  const open = views.filter((v): v is Extract<JobView, { state: "open" }> => v.state === "open");
  return {
    held: await Promise.all(held.map(withPhoto)),
    open: await Promise.all(open.map(withPhoto)),
    pushDevices: devices.length,
  };
}
