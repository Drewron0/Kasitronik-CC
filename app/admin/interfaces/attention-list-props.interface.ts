import type { AttentionData } from "./attention-data.interface";

export interface AttentionListProps {
  data: AttentionData;
  onChanged: () => void;
}
