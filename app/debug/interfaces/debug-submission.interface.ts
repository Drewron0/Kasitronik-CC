import type { SubmissionStatus } from "@/app/dashboard/interfaces/submission-status.type";

export interface DebugSubmissionRow {
  id: string;
  item_name: string;
  status: SubmissionStatus;
  handover_code: string | null;
  collector_id: string | null;
  collector_rating: number | null;
  created_at: string;
}
