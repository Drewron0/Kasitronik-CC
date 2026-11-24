import type { AdminProblem } from "@/lib/collector/interfaces/admin-problem.interface";
import type { UnclaimedReport } from "./unclaimed-report.interface";

export interface AttentionData {
  unclaimed: UnclaimedReport[];
  problems: AdminProblem[];
}
