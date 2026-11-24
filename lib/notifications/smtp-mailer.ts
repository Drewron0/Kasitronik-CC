import nodemailer from "nodemailer";
import type { Notifier } from "./interfaces/notifier.interface.ts";

export function createSmtpSender(config: { host: string; port: number; user: string; pass: string; from: string }): Notifier["email"] {
  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: 10_000,
  });
  return async message => {
    try {
      await transport.sendMail({ from: config.from, to: message.to, subject: message.subject, text: message.text });
      return { ok: true };
    } catch (error) {
      return { ok: false, gone: false, error: error instanceof Error ? error.message : String(error) };
    }
  };
}
