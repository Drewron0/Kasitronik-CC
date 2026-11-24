import type { JobRef } from "./job-ref.type";

export interface JobActionProps {
  jobRef: JobRef;
  /** Where to go after a successful claim from the home page; otherwise the page refreshes in place. */
  afterClaimHref?: string;
}
