export type HandoverCheck =
  | { kind: "ok" }
  | { kind: "wrong"; attempts: number; lockedUntil: string | null }
  | { kind: "locked"; lockedUntil: string };
