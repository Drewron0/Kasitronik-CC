import type { Notifier } from "../../notifications/interfaces/notifier.interface.ts";
import type { CollectorStore } from "./collector-store.interface.ts";

/** Everything a collector-flow service needs, passed in so tests can swap the store and notifier. */
export interface CollectorContext {
  store: CollectorStore;
  notifier: Notifier;
  now: Date;
  /** Public origin without trailing slash, used in links. */
  appUrl: string;
  /** Receives unclaimed and problem alerts; alerts are skipped when empty. */
  adminEmail?: string;
}
