import type { SubmissionStatus } from "@/app/dashboard/interfaces/submission-status.type";

export interface DebugUpdatePayload {
  submissionId: string;
  status?: SubmissionStatus;
  collector_name?: string | null;
  collector_phone?: string | null;
  reset_rating?: boolean;
}

export interface DebugUpdateResult {
  success: boolean;
  error?: string;
}
