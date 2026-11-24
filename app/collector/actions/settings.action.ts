"use server";

import { revalidatePath } from "next/cache";
import { getCollectorContext } from "@/lib/collector/server";
import type { NotifyMode } from "@/lib/collector/interfaces/notify-mode.type";
import { INVALID_LINK } from "../action-messages";
import { validateAreas } from "@/lib/collector/areas";
import { getCurrentCollector } from "../current-collector";
import type { ActionResult } from "../interfaces/action-result.type";

async function withCollector(apply: (collectorId: string) => Promise<ActionResult>): Promise<ActionResult> {
  const ctx = getCollectorContext();
  const collector = await getCurrentCollector(ctx);
  if (!collector) return INVALID_LINK;
  const result = await apply(collector.id);
  revalidatePath("/p");
  return result;
}

export async function setPaused(paused: boolean): Promise<ActionResult> {
  return withCollector(async id => {
    await getCollectorContext().store.updateCollector(id, { paused: paused === true });
    return { ok: true };
  });
}

export async function setNotifyMode(mode: NotifyMode): Promise<ActionResult> {
  if (mode !== "instant" && mode !== "digest") return { ok: false, error: "Pilihan notifikasi tidak dikenal." };
  return withCollector(async id => {
    await getCollectorContext().store.updateCollector(id, { notify_mode: mode });
    return { ok: true };
  });
}

export async function saveAreas(areas: unknown): Promise<ActionResult> {
  const checked = validateAreas(areas);
  if (!checked.ok) return { ok: false, error: checked.error };
  return withCollector(async id => {
    await getCollectorContext().store.replaceAreas(id, checked.areas);
    return { ok: true };
  });
}
