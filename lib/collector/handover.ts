import { randomInt } from "node:crypto";
import { HANDOVER_LOCK_MINUTES, HANDOVER_MAX_ATTEMPTS } from "./rules.ts";
import type { HandoverCheck } from "./interfaces/handover-check.type.ts";
import type { HandoverState } from "./interfaces/handover-state.interface.ts";

export function createHandoverCode(): string {
  return String(randomInt(0, 10_000)).padStart(4, "0");
}

export function checkHandover(state: HandoverState, code: string, now: Date): HandoverCheck {
  const locked = state.lockedUntil !== null && new Date(state.lockedUntil).getTime() > now.getTime();
  if (locked) return { kind: "locked", lockedUntil: state.lockedUntil as string };
  if (code.trim() === state.code) return { kind: "ok" };
  // An expired lock starts a fresh round of attempts.
  const attempts = (state.lockedUntil === null ? state.attempts : 0) + 1;
  const lockedUntil = attempts >= HANDOVER_MAX_ATTEMPTS
    ? new Date(now.getTime() + HANDOVER_LOCK_MINUTES * 60_000).toISOString()
    : null;
  return { kind: "wrong", attempts, lockedUntil };
}
