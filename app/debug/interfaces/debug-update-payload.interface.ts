import type { SubmissionStatus } from "@/app/dashboard/interfaces/submission-status.type";

export interface DebugUpdatePayload {
  submissionId: string;
  status: SubmissionStatus;
}

export interface DebugUpdateResult {
  success: boolean;
  error?: string;
}

