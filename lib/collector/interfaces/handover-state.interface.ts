export interface HandoverState {
  code: string;
  attempts: number;
  lockedUntil: string | null;
}
