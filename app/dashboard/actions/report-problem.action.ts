import { ownerRequest } from "./owner-request";
import type { OwnerActionResult } from "../interfaces/owner-action-result.interface";

export async function reportProblemAction(submissionId: string, message: string): Promise<OwnerActionResult> {
  return ownerRequest(`/api/reports/${encodeURIComponent(submissionId)}/problem`, { message });
}
