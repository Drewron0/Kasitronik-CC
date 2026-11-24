import type { CollectorArea } from "./collector-area.interface.ts";
import type { NotifyMode } from "./notify-mode.type.ts";

export interface CandidateCollector {
  id: string;
  active: boolean;
  paused: boolean;
  notifyMode: NotifyMode;
  areas: CollectorArea[];
}
