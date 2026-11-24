import "server-only";
import { getAdminClient } from "@/lib/supabase-admin";
import { createSupabaseAdminStore } from "./supabase-admin-store";
import type { AdminStore } from "./interfaces/admin-store.interface";

export function getAdminStore(): AdminStore {
  return createSupabaseAdminStore(getAdminClient());
}

export const adminJson = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

/** Reads a JSON object body; null when the body is missing or not an object. */
export async function readJsonObject(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
