import type { AdminCollectorRow } from "@/lib/collector/interfaces/admin-collector-row.interface";

export interface CollectorListProps {
  collectors: AdminCollectorRow[];
  onChanged: () => void;
}
