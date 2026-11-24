import { ownerRequest } from "./owner-request";
import type { OwnerActionResult } from "../interfaces/owner-action-result.interface";

/** Cancels a pending or accepted report; the server tells the collector when one was assigned. */
export async function cancelSubmissionAction(submissionId: string): Promise<OwnerActionResult> {
  if (!submissionId) return { success: false, error: "ID laporan tidak valid." };
  return ownerRequest(`/api/reports/${encodeURIComponent(submissionId)}/cancel`);
}
