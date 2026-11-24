import type { JobRef } from "./job-ref.type";

export interface JobPageLoaderProps {
  /** Resolves to the job reference once the dynamic route params are read. */
  jobRef: Promise<JobRef>;
}
