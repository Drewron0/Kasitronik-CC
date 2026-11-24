/** Collector details an owner sees once their report is taken. */
export interface SubmissionCollector {
  name: string;
  phone: string;
  rating: number | null;
  completedJobs: number;
}
