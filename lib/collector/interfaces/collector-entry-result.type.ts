export type CollectorEntryResult =
  | { ok: true; id?: string; link?: string }
  | { ok: false; error: string; field?: "name" | "phone" | "areas" };
