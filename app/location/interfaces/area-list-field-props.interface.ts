import type { CollectorArea } from "@/lib/collector/interfaces/collector-area.interface";

export interface AreaListFieldProps {
  value: CollectorArea[];
  disabled: boolean;
  onChange: (areas: CollectorArea[]) => void;
}
