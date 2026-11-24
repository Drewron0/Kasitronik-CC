export type CompleteResult =
  | { kind: "completed" }
  | { kind: "wrong_code"; attemptsLeft: number }
  | { kind: "locked"; lockedUntil: string }
  | { kind: "invalid_price" }
  | { kind: "not_yours" };
