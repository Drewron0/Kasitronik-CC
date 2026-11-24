import "server-only";
import { getAdminClient } from "@/lib/supabase-admin";
import { getNotifier } from "@/lib/notifications/get-notifier";
import { createSupabaseCollectorStore } from "./supabase-store";
import type { CollectorContext } from "./interfaces/collector-context.interface";
import type { CollectorStore } from "./interfaces/collector-store.interface";

export function getAppUrl(): string {
  return (process.env.APP_BASE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

/** Connects to Supabase on first use, so pages that never touch data (an invalid link) render without it. */
function lazyStore(): CollectorStore {
  let real: CollectorStore | null = null;
  const get = () => (real ??= createSupabaseCollectorStore(getAdminClient()));
  return new Proxy({} as CollectorStore, {
    get: (_target, key) => (...args: unknown[]) => (get()[key as keyof CollectorStore] as (...a: unknown[]) => unknown)(...args),
  });
}

/** Builds the live context: Supabase store with the secret key, real or console notifier, current time. */
export function getCollectorContext(): CollectorContext {
  return {
    store: lazyStore(),
    notifier: getNotifier(),
    now: new Date(),
    appUrl: getAppUrl(),
    adminEmail: process.env.ADMIN_EMAIL || undefined,
  };
}
