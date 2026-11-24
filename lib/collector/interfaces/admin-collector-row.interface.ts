import type { CollectorArea } from "./collector-area.interface.ts";
import type { NotifyMode } from "./notify-mode.type.ts";

/** What the admin list shows per collector. Never carries the token hash. */
export interface AdminCollectorRow {
  id: string;
  name: string;
  phone: string;
  active: boolean;
  paused: boolean;
  notifyMode: NotifyMode;
  areas: CollectorArea[];
  pushEnabled: boolean;
  rating: number | null;
  completedJobs: number;
}
