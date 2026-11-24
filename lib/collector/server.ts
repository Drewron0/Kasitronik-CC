import "server-only";
import { getAdminClient } from "@/lib/supabase-admin";
import { getNotifier } from "@/lib/notifications/get-notifier";
import { createSupabaseCollectorStore } from "./supabase-store";
import type { CollectorContext } from "./interfaces/collector-context.interface";

export function getAppUrl(): string {
  return (process.env.APP_BASE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

/** Builds the live context: Supabase store with the secret key, real or console notifier, current time. */
export function getCollectorContext(): CollectorContext {
  return {
    store: createSupabaseCollectorStore(getAdminClient()),
    notifier: getNotifier(),
    now: new Date(),
    appUrl: getAppUrl(),
    adminEmail: process.env.ADMIN_EMAIL || undefined,
  };
}
