import type { JobRef } from "./job-ref.type";

export interface HandoverFormProps {
  jobRef: JobRef;
  lockedUntil: string | null;
}
