export type AdminResponse<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string; field?: "name" | "phone" | "areas" };
