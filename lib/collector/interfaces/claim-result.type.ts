export type ClaimResult = { kind: "claimed" } | { kind: "taken" } | { kind: "closed" } | { kind: "not_found" };
