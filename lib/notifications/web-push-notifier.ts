import { sendNotification } from "web-push";
import type { Notifier } from "./interfaces/notifier.interface.ts";

const TTL_SECONDS = 12 * 60 * 60;

export function createWebPushSender(keys: { publicKey: string; privateKey: string; subject: string }): Notifier["push"] {
  return async (target, payload) => {
    try {
      await sendNotification(
        { endpoint: target.endpoint, keys: { p256dh: target.p256dh, auth: target.auth } },
        JSON.stringify(payload),
        { TTL: TTL_SECONDS, vapidDetails: keys, timeout: 10_000 },
      );
      return { ok: true };
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode;
      return { ok: false, gone: status === 404 || status === 410, error: error instanceof Error ? error.message : String(error) };
    }
  };
}
