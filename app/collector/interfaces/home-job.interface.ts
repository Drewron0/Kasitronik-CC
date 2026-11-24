import type { JobSummary } from "@/lib/collector/interfaces/job-view.type";

export interface HomeJob {
  job: JobSummary;
  photoUrl: string | null;
}
