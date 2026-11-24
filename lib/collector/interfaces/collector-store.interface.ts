import type { CandidateCollector } from "./candidate-collector.interface.ts";
import type { CollectorArea } from "./collector-area.interface.ts";
import type { Collector } from "./collector.interface.ts";
import type { JobOffer } from "./job-offer.interface.ts";
import type { JobOfferStatus } from "./job-offer-status.type.ts";
import type { NewOffer } from "./new-offer.interface.ts";
import type { NotificationEntry } from "./notification-entry.interface.ts";
import type { PushTarget } from "./push-target.interface.ts";
import type { SubmissionForCollector } from "./submission-for-collector.interface.ts";

/** Data access for the collector flow. Patches use database (snake_case) column names. */
export interface CollectorStore {
  getCollectorByTokenHash(hash: string): Promise<Collector | null>;
  getCollector(id: string): Promise<Collector | null>;
  listDispatchable(): Promise<CandidateCollector[]>;
  getSubmission(id: string): Promise<SubmissionForCollector | null>;
  listPending(): Promise<SubmissionForCollector[]>;
  /** Submissions a collector currently holds (status accepted). */
  listHeldBy(collectorId: string): Promise<SubmissionForCollector[]>;
  replaceAreas(collectorId: string, areas: CollectorArea[]): Promise<void>;
  listOfferedCollectorIds(submissionId: string): Promise<string[]>;
  /** Inserts offers, silently skipping (submission, collector) pairs that already exist. */
  insertOffers(rows: NewOffer[]): Promise<void>;
  getOfferByTokenHash(hash: string): Promise<JobOffer | null>;
  findOffer(submissionId: string, collectorId: string): Promise<JobOffer | null>;
  markOfferOpened(offerId: string, at: string): Promise<void>;
  setOffersStatus(
    submissionId: string,
    status: JobOfferStatus,
    opts?: { onlyCollectorId?: string; exceptCollectorId?: string; fromStatus?: JobOfferStatus },
  ): Promise<void>;
  /** Applies the patch only when every expected field matches; true when exactly one row changed. */
  updateSubmissionIf(
    id: string,
    expected: { status?: string; collectorId?: string | null; waveCount?: number; handoverAttempts?: number },
    patch: Record<string, unknown>,
  ): Promise<boolean>;
  updateCollector(id: string, patch: Record<string, unknown>): Promise<void>;
  listPushTargets(collectorId: string): Promise<PushTarget[]>;
  savePushTarget(collectorId: string, target: PushTarget): Promise<void>;
  deletePushTarget(endpoint: string): Promise<void>;
  getOwnerEmail(ownerId: string): Promise<string | null>;
  getCollectorRating(collectorId: string): Promise<number | null>;
  insertProblem(problem: { submissionId: string; ownerId: string; message: string }): Promise<void>;
  logNotification(entry: NotificationEntry): Promise<void>;
  listRetryableNotifications(maxAttempts: number): Promise<NotificationEntry[]>;
  updateNotification(id: string, patch: Partial<NotificationEntry>): Promise<void>;
}
