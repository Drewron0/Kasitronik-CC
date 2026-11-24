import { createConsoleNotifier, createUnconfiguredNotifier } from "./console-notifier.ts";
import { createSmtpSender } from "./smtp-mailer.ts";
import { createWebPushSender } from "./web-push-notifier.ts";
import type { Notifier } from "./interfaces/notifier.interface.ts";

type Env = Record<string, string | undefined>;

/** Picks real senders per channel when their env is complete; otherwise logs to the console. */
export function getNotifier(env: Env = process.env): Notifier {
  // In production a missing channel is a failure, so it is logged as failed and retried once configured.
  const fallback = env.NODE_ENV === "production" ? createUnconfiguredNotifier() : createConsoleNotifier();
  const { NEXT_PUBLIC_VAPID_PUBLIC_KEY: publicKey, VAPID_PRIVATE_KEY: privateKey, VAPID_SUBJECT: subject } = env;
  const { SMTP_HOST: host, SMTP_PORT: port, SMTP_USER: user, SMTP_PASS: pass, EMAIL_FROM: from } = env;
  return {
    push: publicKey && privateKey && subject ? createWebPushSender({ publicKey, privateKey, subject }) : fallback.push,
    email: host && user && pass && from ? createSmtpSender({ host, port: Number(port) || 587, user, pass, from }) : fallback.email,
  };
}
