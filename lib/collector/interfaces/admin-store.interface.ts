import type { AdminProblem } from "./admin-problem.interface.ts";
import type { Collector } from "./collector.interface.ts";
import type { CollectorArea } from "./collector-area.interface.ts";
import type { NotifyMode } from "./notify-mode.type.ts";
import type { SubmissionForCollector } from "./submission-for-collector.interface.ts";

/** Data access for the admin pages. Patches use database (snake_case) column names. */
export interface AdminStore {
  listCollectors(): Promise<Collector[]>;
  countPushTargets(collectorId: string): Promise<number>;
  collectorStats(collectorId: string): Promise<{ rating: number | null; completedJobs: number }>;
  createCollector(row: { name: string; phone: string; notifyMode: NotifyMode; accessTokenHash: string }): Promise<{ id: string } | { duplicate: true }>;
  /** false when the collector does not exist, "duplicate" when the phone belongs to another collector. */
  updateCollector(id: string, patch: Record<string, unknown>): Promise<boolean | "duplicate">;
  replaceAreas(collectorId: string, areas: CollectorArea[]): Promise<void>;
  listEscalated(minWaves: number): Promise<SubmissionForCollector[]>;
  listOpenProblems(): Promise<AdminProblem[]>;
  resolveProblem(id: string, at: string): Promise<boolean>;
}
