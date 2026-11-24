import type { CandidateCollector } from "./candidate-collector.interface.ts";

export interface Collector extends CandidateCollector {
  name: string;
  phone: string;
  lastDigestAt: string | null;
  createdAt: string;
}
