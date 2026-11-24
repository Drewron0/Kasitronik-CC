"use server";

import { getCollectorContext } from "@/lib/collector/server";
import { INVALID_LINK } from "../action-messages";
import { getCurrentCollector } from "../current-collector";
import type { ActionResult } from "../interfaces/action-result.type";

const PUSH_ENDPOINT = /^https:\/\/[^\s]{1,2000}$/;

export async function subscribePush(sub: { endpoint: string; keys: { p256dh: string; auth: string } }): Promise<ActionResult> {
  const valid = sub && typeof sub.endpoint === "string" && PUSH_ENDPOINT.test(sub.endpoint)
    && typeof sub.keys?.p256dh === "string" && sub.keys.p256dh.length <= 200
    && typeof sub.keys?.auth === "string" && sub.keys.auth.length <= 100;
  if (!valid) return { ok: false, error: "Browser ini belum mendukung notifikasi." };
  const ctx = getCollectorContext();
  const collector = await getCurrentCollector(ctx);
  if (!collector) return INVALID_LINK;
  await ctx.store.savePushTarget(collector.id, { endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth });
  return { ok: true };
}
