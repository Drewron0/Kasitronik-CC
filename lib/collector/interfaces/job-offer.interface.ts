import type { JobOfferStatus } from "./job-offer-status.type.ts";

export interface JobOffer {
  id: string;
  submissionId: string;
  collectorId: string;
  wave: number;
  status: JobOfferStatus;
  openedAt: string | null;
}
