import { connection } from "next/server";
import { getCollectorContext } from "@/lib/collector/server";
import { buildJobView } from "@/lib/collector/services/job-view";
import { resolveJob } from "../current-collector";
import type { JobPageLoaderProps } from "../interfaces/job-page-loader-props.interface";
import { signedPhotoUrl } from "../photo";
import InvalidLink from "./InvalidLink";
import JobDetail from "./JobDetail";
import styles from "../collector.module.css";

export default async function JobPageLoader({ jobRef: refPromise }: JobPageLoaderProps) {
  await connection();
  const jobRef = await refPromise;
  const ctx = getCollectorContext();
  const job = await resolveJob(ctx, jobRef);
  if (!job) return <InvalidLink />;
  if (job.offerId) await ctx.store.markOfferOpened(job.offerId, ctx.now.toISOString());

  const view = await buildJobView(ctx, job.collectorId, job.submissionId);
  const photoUrl = "photoPath" in view ? await signedPhotoUrl(view.photoPath) : null;
  return (
    <div className={styles.column}>
      <JobDetail view={view} jobRef={jobRef} photoUrl={photoUrl} />
    </div>
  );
}
