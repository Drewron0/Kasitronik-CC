import type { Notifier } from "./interfaces/notifier.interface.ts";

/** Development fallback: prints notifications instead of sending them. */
export function createConsoleNotifier(): Notifier {
  return {
    async push(target, payload) {
      console.info("[notify:push]", target.endpoint.slice(0, 40), payload.title, "-", payload.body, payload.url);
      return { ok: true };
    },
    async email(message) {
      console.info("[notify:email]", message.to, message.subject, "\n" + message.text);
      return { ok: true };
    },
  };
}
