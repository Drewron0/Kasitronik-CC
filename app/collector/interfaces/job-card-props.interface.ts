import type { JobSummary } from "@/lib/collector/interfaces/job-view.type";

export interface JobCardProps {
  job: JobSummary;
  photoUrl: string | null;
  href: string;
}
