import type { JobView } from "@/lib/collector/interfaces/job-view.type";
import type { JobRef } from "./job-ref.type";

export interface JobDetailProps {
  view: JobView;
  jobRef: JobRef;
  photoUrl: string | null;
  afterClaimHref?: string;
}
